// Dosya Yolu: app/api/audit/route.ts
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { runAuditEngine } from "@/src/lib/services/auditService";
import { createClient as createServerClient } from "@/src/utils/supabase/server";

// YENİ: Güvenlik duvarını (RLS) aşıp parayı tahsil etmek için "God Mode" Admin Anahtarı
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // DİKKAT: .env dosyasında bu anahtar olmalı
);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    // Normal kullanıcı yetkilerini doğrulamak için standart client
    const supabase = accessToken
      ? createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: { headers: { Authorization: `Bearer ${accessToken}` } },
            auth: { persistSession: false, autoRefreshToken: false },
          }
        )
      : await createServerClient();

    const {
      data: { user },
      error: authError,
    } = accessToken
      ? await supabase.auth.getUser(accessToken)
      : await supabase.auth.getUser();

    // 1. KİMLİK KONTROLÜ
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. KREDİ KONTROLÜ (Okuma işlemini Admin ile garantiye alalım)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    if (!profile || profile.credits <= 0) {
      return NextResponse.json({ 
        error: "Insufficient credits. Please upgrade your plan." 
      }, { status: 403 });
    }

    const { url, type, platform, documentContent, language } = await req.json();
    
    // 3. AI MOTORUNU ÇALIŞTIR
    const reportData = await runAuditEngine(url, type, platform, documentContent, language);
    
    // 4. KESİN KREDİ DÜŞÜŞÜ (ADMIN YETKİSİYLE RLS'Yİ DELİP GEÇER)
    if (reportData && Object.keys(reportData).length > 0) {
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ credits: profile.credits - 1 })
            .eq('id', user.id);

        if (updateError) {
            console.error("[Billing Admin] Kredi düşülemedi DB Hatası:", updateError);
        } else {
            console.log(`[Billing] Audit başarıyla tamamlandı. -1 Kredi düşüldü. User: ${user.id}`);
        }
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Audit Route Error:", error);
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}