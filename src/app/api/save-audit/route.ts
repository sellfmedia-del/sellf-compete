// Dosya Yolu: app/api/save-audit/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase"; 

// KESİN ÇÖZÜM 1: Vercel'in bu API'yi önbelleğe almasını (cache) YASAKLIYORUZ.
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let { raw_data, status, input_type, platform } = body;

    // KESİN ÇÖZÜM 2 (Sterilizasyon): 
    // Vercel cache'inden dolayı eski kod çalışır ve inatla "unknown" gelirse, 
    // Supabase'in çökmemesi için geçerli değerlere (product ve Trendyol) zorluyoruz.
    if (!input_type || input_type === "unknown") {
        input_type = "product";
    }
    
    if (!platform || platform === "unknown") {
        platform = "Trendyol";
    }

    // Supabase'e güvenli, temizlenmiş veriyi yazıyoruz
    const { data, error } = await supabase
      .from('audits')
      .insert([
        { 
          raw_data: raw_data, 
          status: status || "completed",
          input_type: input_type,
          platform: platform
        }
      ]);

    if (error) {
      console.error("Supabase Insert Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Save Audit Error:", error);
    return NextResponse.json({ error: "Failed to save audit" }, { status: 500 });
  }
}