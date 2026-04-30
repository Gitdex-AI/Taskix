import { NextResponse } from "next/server";
import { runNextJob } from "@/lib/job-runner";

export async function POST() {
  return NextResponse.json(await runNextJob());
}
