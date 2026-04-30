import { NextResponse } from "next/server";
import { checkCodexStatus, getCachedCodexStatus, saveCodexStatus } from "@/lib/codex-status";
import { getSettings } from "@/lib/settings";

export async function GET() {
  return NextResponse.json({ status: getCachedCodexStatus() });
}

export async function POST() {
  const settings = await getSettings();
  const status = await checkCodexStatus(settings);
  saveCodexStatus(status);
  return NextResponse.json({ status });
}
