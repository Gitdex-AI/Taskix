import { NextRequest, NextResponse } from "next/server";
import {
  runConfirmedSelfUpdate,
  selfUpdateGuard,
  type SelfUpdateConfirmationInput
} from "@/lib/self-update";
import { requireConsoleApiAuth } from "@/lib/console-auth";

export async function POST(request: NextRequest) {
  const unauthorized = await requireConsoleApiAuth();
  if (unauthorized) return unauthorized;
  const guard = selfUpdateGuard(request);
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status });
  }

  const response = await runConfirmedSelfUpdate(await readConfirmationPayload(request));
  if (!response.ok || !response.result) {
    return NextResponse.json({ ok: false, error: response.error, result: response.result }, { status: response.status });
  }

  return NextResponse.json(response.result, { status: response.status });
}

async function readConfirmationPayload(request: Request): Promise<SelfUpdateConfirmationInput> {
  try {
    return (await request.json()) as SelfUpdateConfirmationInput;
  } catch {
    return {};
  }
}
