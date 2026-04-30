import { NextResponse } from "next/server";
import { createWorkflow } from "@/lib/orchestrator";
import { createJob, getChatProject, listWorkflows } from "@/lib/store";

export async function GET() {
  return NextResponse.json(await listWorkflows());
}

export async function POST(request: Request) {
  const body = (await request.json()) as { requirement?: string; chatId?: number };
  if (!body.requirement) return NextResponse.json({ error: "requirement is required" }, { status: 400 });
  const chatId = body.chatId ?? 0;
  const project = await getChatProject(chatId);
  const workflow = await createWorkflow(body.requirement, chatId, project);
  const job = await createJob({
    projectId: project?.projectId ?? null,
    type: "workflow_run",
    payload: { workflowId: workflow.workflowId }
  });
  return NextResponse.json({ workflow, job });
}
