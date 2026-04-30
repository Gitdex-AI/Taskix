import { NextResponse } from "next/server";
import { runNextJob } from "@/lib/job-runner";
import { getProject } from "@/lib/store";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const result = await runNextJob(project.projectId);
  return NextResponse.json(result);
}
