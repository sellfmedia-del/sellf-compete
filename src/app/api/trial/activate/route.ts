// Dosya Yolu: src/app/api/trial/activate/route.ts
import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// God Mode Admin Anahtarı — RLS'i aşıp profiles tablosuna doğrudan yazmak için
// (aynı pattern /api/audit/route.ts'de de kullanılıyor, tutarlılık için aynı yaklaşım)
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TRIAL_CREDITS = 3;
const TRIAL_DAYS = 7;

export async function POST(req: Request) {
  try {
    const { userId, fullName, companyName, email } = await req.json();

    if (!userId || !fullName || !companyName || !email) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    // 1. KÖTÜYE KULLANIM KONTROLÜ
    // Aynı firma adından (büyük/küçük harf duyarsız) daha önce trial açılmış mı?
    // Mükemmel bir koruma değil (biri firma adını değiştirebilir) ama ucuz ve ilk bariyer olarak işe yarar.
    const normalizedCompany = companyName.trim().toLowerCase();

    const { data: existingTrials, error: checkError } = await supabaseAdmin
      .from("profiles")
      .select("id, company_name")
      .eq("is_trial", true)
      .ilike("company_name", normalizedCompany);

    if (checkError) {
      console.error("[Trial Activate] Abuse check error:", checkError);
      // Kontrol hatası kullanıcıyı bloklamasın, sadece logla ve devam et
    }

    if (existingTrials && existingTrials.length > 0) {
      return NextResponse.json(
        {
          error:
            "A free trial has already been used for this company. Please subscribe to continue, or contact support if you believe this is a mistake.",
        },
        { status: 409 }
      );
    }

    // 2. TRIAL DEĞERLERİNİ HESAPLA
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);

    // 3. PROFİLİ AKTİVE ET (upsert — trigger'la satır zaten oluşmuş olabilir, olmamış da olabilir)
    const { error: upsertError } = await supabaseAdmin
      .from("profiles")
      .upsert(
        {
          id: userId,
          full_name: fullName,
          company_name: companyName,
          is_trial: true,
          trial_ends_at: trialEndsAt.toISOString(),
          credits: TRIAL_CREDITS,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (upsertError) {
      console.error("[Trial Activate] Upsert error:", upsertError);
      return NextResponse.json({ error: "Could not activate trial." }, { status: 500 });
    }

    console.log(`[Trial Activate] Trial started for ${email} (${companyName}) — ${TRIAL_CREDITS} credits, ends ${trialEndsAt.toISOString()}`);

    return NextResponse.json({
      success: true,
      credits: TRIAL_CREDITS,
      trialEndsAt: trialEndsAt.toISOString(),
    });
  } catch (error) {
    console.error("[Trial Activate] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}