// Dosya Yolu: app/api/audit/route.ts
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { runAuditEngine } from "@/src/lib/services/auditService";
import { createClient as createServerClient } from "@/src/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    // Web client: reads auth session from cookies.
    // Mobile client: uses Authorization Bearer token.
    const supabase = accessToken
      ? createSupabaseClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          {
            global: {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            },
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
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

    // 2. KREDİ KONTROLÜ (Pre-flight Check)
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single();

    // Kredi yoksa motoru hiç yormadan kapıdan çevir
    if (!profile || profile.credits <= 0) {
      return NextResponse.json({ 
        error: "Insufficient credits. Please upgrade your plan." 
      }, { status: 403 });
    }

    const { url, type, platform, documentContent, language } = await req.json();
    
    // 3. AI MOTORUNU ÇALIŞTIR (Maliyetin oluştuğu an)
    const reportData = await runAuditEngine(url, type, platform, documentContent, language);
    
    // 4. GÜVENLİ KREDİ DÜŞÜŞÜ (SADECE YAPAY ZEKA BAŞARILIYSA)
    if (reportData && Object.keys(reportData).length > 0) {
        try {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ credits: profile.credits - 1 })
                .eq('id', user.id);

            if (updateError) {
                console.error("[Billing] Kredi düşülemedi:", updateError);
                // Not: Kullanıcıya hatayı yansıtmıyoruz, rapor üretildi çünkü.
            } else {
                console.log(`[Billing] Audit başarıyla tamamlandı. -1 Kredi düşüldü. User: ${user.id}`);
            }
        } catch (dbError) {
             console.error("[Billing] DB Hatası, kredi düşülemedi:", dbError);
        }
    }

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Audit Route Error:", error);
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}