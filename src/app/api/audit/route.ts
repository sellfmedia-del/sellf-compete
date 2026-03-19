import { NextResponse } from "next/server";
import { runAuditEngine } from "@/src/lib/services/auditService";

export async function POST(req: Request) {
  try {
    // YENİ ÖZELLİK: documentContent parametresi API'den karşılanıyor
    const { url, type, platform, documentContent } = await req.json();
    
    // Motor, bu 4 veriyi de içine alarak çalıştırılıyor
    const reportData = await runAuditEngine(url, type, platform, documentContent);
    
    return NextResponse.json(reportData);
  } catch (error) {
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}