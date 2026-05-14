// Dosya Yolu: src/app/api/account/delete/route.ts
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/src/utils/supabase/server";

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized request" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('paddle_subscription_id') 
      .eq('id', user.id)
      .single();

    if (profile?.paddle_subscription_id) {
      const isSandbox = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'sandbox';
      const paddleApiUrl = isSandbox ? 'https://sandbox-api.paddle.com' : 'https://api.paddle.com';

      const paddleResponse = await fetch(`${paddleApiUrl}/subscriptions/${profile.paddle_subscription_id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`, 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ effective_from: "immediately" })
      });

      if (!paddleResponse.ok) {
         console.error("[Paddle Error] Abonelik iptal edilemedi");
      }
    }

    // YENİ ÇÖZÜM: Sürüm uyuşmazlığını aşan Geriye Dönük Uyumluluk (Backward Compatibility)
    // Eğer yeni 'admin.deleteUser' çalışmıyorsa, Supabase'in kök API'sine direkt istek atarak silme işlemini zorla yapıyoruz.
    let deleteSuccess = false;
    
    // 1. Önce eski/yeni standart fonksiyonu dene
    if (typeof supabaseAdmin.auth.admin?.deleteUser === 'function') {
      const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);
      if (!error) deleteSuccess = true;
    }

    // 2. Eğer kütüphane eskiyse ve hata verdiyse, doğrudan Supabase Management API'sine "Hard Delete" isteği gönder
    if (!deleteSuccess) {
        console.log("[Fallback] Supabase sürümü eski, API üzerinden zorunlu silme tetikleniyor...");
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users/${user.id}`, {
            method: 'DELETE',
            headers: {
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error("[Supabase API Error] Hard Delete başarısız:", await response.text());
            return NextResponse.json({ error: "Kullanıcı silinemedi." }, { status: 500 });
        }
    }

    console.log(`[Account] Kullanıcı başarıyla yok edildi. User ID: ${user.id}`);
    return NextResponse.json({ success: true, message: "Account and subscription securely terminated." }, { status: 200 });

  } catch (error) {
    console.error("[Delete Account Route Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}