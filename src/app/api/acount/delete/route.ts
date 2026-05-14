// Dosya Yolu: app/api/account/delete/route.ts
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/src/utils/supabase/server";

// 0. GÜVENLİK DUVARINI AŞMAK İÇİN ADMIN İSTEMCİSİ
// Standart kullanıcı kendi hesabını "Auth" sisteminden tamamen silemez. Bunun için God Mode gerekir.
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function DELETE(req: Request) {
  try {
    // 1. KULLANICI DOĞRULAMA (İsteği gerçekten giriş yapmış biri mi atıyor?)
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized request" }, { status: 401 });
    }

    // 2. KULLANICI PROFİLİNİ VE ABONELİK BİLGİSİNİ ÇEK
    // Veritabanından kullanıcının Paddle Subscription ID'sini alıyoruz
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('paddle_subscription_id') 
      .eq('id', user.id)
      .single();

    // 3. PADDLE ABONELİK İPTALİ (Zombi Abonelik Koruması)
    if (profile?.paddle_subscription_id) {
      const isSandbox = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'sandbox';
      const paddleApiUrl = isSandbox 
        ? 'https://sandbox-api.paddle.com' 
        : 'https://api.paddle.com';

      // Paddle API'sine "Bu aboneliği anında iptal et" komutu gönderiyoruz
      const paddleResponse = await fetch(`${paddleApiUrl}/subscriptions/${profile.paddle_subscription_id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PADDLE_API_KEY}`, // DİKKAT: Client Token DEĞİL, gizli API Key!
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          effective_from: "immediately" // Döngü sonunu bekleme, anında iptal et
        })
      });

      if (!paddleResponse.ok) {
         const errorData = await paddleResponse.json();
         console.error("[Paddle Error] Abonelik iptal edilemedi:", errorData);
         // Hata verse bile (örn: zaten iptal edilmişse) hesabı silme işlemine devam etmesi için bilerek return fırlatmıyoruz.
      } else {
         console.log(`[Billing] Abonelik başarıyla iptal edildi. Sub ID: ${profile.paddle_subscription_id}`);
      }
    }

    // 4. SUPABASE AUTH VE VERİTABANINDAN KÖKTEN SİLME
    // Bu kod auth.users tablosundan siler. Supabase "Cascade" mantığıyla profiles tablosunu da temizler.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("[Supabase Error] Kullanıcı silinemedi:", deleteError);
      return NextResponse.json({ error: "Kullanıcı veritabanından silinirken hata oluştu." }, { status: 500 });
    }

    console.log(`[Account] Kullanıcı başarıyla yok edildi. User ID: ${user.id}`);
    
    // İşlem başarılı, frontend'e onay gönderiyoruz
    return NextResponse.json({ success: true, message: "Account and subscription securely terminated." }, { status: 200 });

  } catch (error) {
    console.error("[Delete Account Route Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}