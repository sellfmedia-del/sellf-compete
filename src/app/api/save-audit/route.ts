// Dosya Yolu: app/api/save-audit/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/src/lib/supabase"; // Birazdan oluşturacağımız istemciyi çağırıyoruz

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { raw_data, status, input_type, platform } = body;

    // Supabase'e veriyi (anonim olarak) yazıyoruz
    const { data, error } = await supabase
      .from('audits')
      .insert([
        { 
          raw_data: raw_data, 
          status: status,
          input_type: input_type,
          platform: platform
          // user_id eklemiyoruz çünkü şu an auth yok.
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