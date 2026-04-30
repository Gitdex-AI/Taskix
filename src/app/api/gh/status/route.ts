import { NextResponse } from "next/server";
import { checkGhStatus, getCachedGhStatus, saveGhStatus } from "@/lib/gh-status";

export async function GET() {
  return NextResponse.json({ status: getCachedGhStatus() });
}

export async function POST() {
  const status = await checkGhStatus();
  saveGhStatus(status);
  return NextResponse.json({ status });
}
