import { NextResponse } from "next/server";
import { requestAutoRunPause } from "@/lib/auto-run-control";
import { requireConsoleApiAuth } from "@/lib/console-auth";
import { getIssueStage } from "@/lib/issue-stage";
import { createJob, getProject, listAgentSessions, listJobs, listProjectWorkflows, saveWorkflow } from "@/lib/store";
import type { AgentSessionRecord } from "@/lib/types";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string; issueId: string }> }) {
  const unauthorized = await requireConsoleApiAuth();
  if (unauthorized) return unauthorized;
  const { projectId, issueId } = await params;
  const project = await getProject(projectId);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const workflows = await listProjectWorkflows(project.projectId);
  const workflow = workflows.find((item) => item.issues.some((issue) => issue.issueId === issueId));
  const issue = workflow?.issues.find((item) => item.issueId === issueId);
  if (!workflow || !issue) return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  if (issue.githubState === "CLOSED" || issue.prState === "MERGED") return NextResponse.json({ error: "Completed issues cannot run Architect." }, { status: 409 });
  if (getIssueStage(issue) !== "gd:architect") return NextResponse.json({ error: "Issue is not waiting for Architect." }, { status: 409 });

  const sessions = await listAgentSessions(project.projectId);
  const blockedSession = findBlockedIssueSession(sessions, workflow.workflowId, issue.issueId);
  if (!blockedSession) {
    return NextResponse.json({ error: "No blocked developer or QA session was found for this issue." }, { status: 409 });
  }

  const existingJob = (await listJobs(project.projectId)).find((job) => (
    job.type === "architect_blocker_run"
    && (job.status === "pending" || job.status === "running")
    && job.payload.workflowId === workflow.workflowId
    && job.payload.issueId === issue.issueId
    && job.payload.sessionKey === blockedSession.sessionKey
  ));
  const job = existingJob ?? await createJob({
    projectId: project.projectId,
    type: "architect_blocker_run",
    payload: {
      workflowId: workflow.workflowId,
      issueId: issue.issueId,
      sessionKey: blockedSession.sessionKey
    }
  });

  workflow.status = "in_progress";
  workflow.timeline.push(existingJob ? `Architect job already queued for ${issue.issueId}.` : `Architect job queued for ${issue.issueId}.`);
  await saveWorkflow(workflow);
  requestAutoRunPause(project.projectId, "Auto Run pause requested because a blocked issue was manually sent to Architect.");

  return NextResponse.json({
    ok: true,
    jobId: job.jobId,
    runStatus: job.status,
    sessionKey: blockedSession.sessionKey
  });
}

function findBlockedIssueSession(sessions: AgentSessionRecord[], workflowId: string, issueId: string): AgentSessionRecord | null {
  return sessions
    .filter((session) => (
      session.workflowId === workflowId
      && session.issueId === issueId
      && session.status === "blocked"
      && (session.role === "qa" || session.role === "developer")
    ))
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))[0] ?? null;
}
