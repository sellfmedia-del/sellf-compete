import { NextResponse } from "next/server";
import { runAuditEngine } from "@/src/lib/services/auditService";

export async function POST(req: Request) {
  try {
    const { url, type, platform } = await req.json();
    const reportData = await runAuditEngine(url, type, platform);
    return NextResponse.json(reportData);
  } catch (error) {
    return NextResponse.json({ error: "Audit failed" }, { status: 500 });
  }
}