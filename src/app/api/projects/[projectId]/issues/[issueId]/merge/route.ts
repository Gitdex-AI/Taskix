import { NextResponse } from "next/server";
import { CodexClient } from "@/lib/codex";
import { getSettings } from "@/lib/settings";
import { appendAgentMessages, getAgentSession, getProject, listProjectWorkflows, saveProject, saveWorkflow } from "@/lib/store";
import type { IssueRecord, ProjectRecord, WorkflowRecord } from "@/lib/types";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string; issueId: string }> }) {
  const { projectId, issueId } = await params;
  const project = await getProject(projectId);
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 });

  const workflows = await listProjectWorkflows(project.projectId);
  const workflow = workflows.find((item) => item.issues.some((issue) => issue.issueId === issueId));
  const issue = workflow?.issues.find((item) => item.issueId === issueId);
  if (!workflow || !issue) return NextResponse.json({ error: "Issue not found." }, { status: 404 });
  if (!issue.prUrl) return NextResponse.json({ error: "Issue has no pull request to merge." }, { status: 400 });
  if (issue.prState === "MERGED") return NextResponse.json({ ok: true, merged: true, issueId, prUrl: issue.prUrl });

  const labels = new Set([...(issue.labels ?? []), ...(issue.prLabels ?? [])].map((label) => label.toLowerCase()));
  const isReady = labels.has("taskix:ready-to-merge");
  if (!isReady) {
    return NextResponse.json({
      error: "Architect code review must pass before merge.",
      action: "Run Architect review after QA passes. Merge is only enabled after taskix:ready-to-merge is applied."
    }, { status: 409 });
  }

  const architectResult = await runArchitectMergeRequest(project, workflow, issue);

  return NextResponse.json({
    ok: true,
    delegated: true,
    issueId,
    prUrl: issue.prUrl,
    architectUrl: `/projects/${project.projectId}?session=${encodeURIComponent(`${project.projectId}:architect`)}`,
    architectReply: architectResult.text
  });
}

async function runArchitectMergeRequest(project: ProjectRecord, workflow: WorkflowRecord, issue: IssueRecord): Promise<{ text: string }> {
  const now = new Date().toISOString();
  const content = [
    "You are architect merge owner.",
    "",
    `GitHub repo: ${project.githubRepo}`,
    `Issue: ${issue.githubIssueNumber ? `#${issue.githubIssueNumber}` : issue.issueId}`,
    `PR: ${issue.prUrl ?? "none"}`,
    "",
    "Read the issue, PR state, checks, labels, comments, and mergeability with gh. Treat GitHub as the source of truth.",
    "Only merge if taskix:ready-to-merge is present and no blocker exists.",
    "If merged, apply taskix:merged and close the issue. If blocked by conflict or checks, comment the blocker and return it to developer."
  ].join("\n");

  workflow.timeline.push(`Requested architect merge handling for ${issue.issueId}.`);
  await saveWorkflow(workflow);

  const sessionKey = `${project.projectId}:architect`;
  const [settings, existingArchitectSession] = await Promise.all([
    getSettings(),
    getAgentSession(sessionKey)
  ]);
  const codex = new CodexClient(settings);
  const result = await codex.architectChat({
    projectName: project.name,
    githubRepo: project.githubRepo,
    message: content,
    sessionId: project.architectSessionId ?? existingArchitectSession?.sessionId ?? null
  });

  if (result.sessionId && result.sessionId !== project.architectSessionId) {
    project.architectSessionId = result.sessionId;
    await saveProject(project);
  }

  await appendAgentMessages({
    sessionKey,
    projectId: project.projectId,
    role: "architect",
    title: "Architect",
    sessionId: result.sessionId ?? project.architectSessionId ?? existingArchitectSession?.sessionId ?? null,
    workflowId: workflow.workflowId,
    issueId: issue.issueId,
    prUrl: issue.prUrl ?? null,
    labels: issue.labels ?? [],
    currentStep: "merge requested",
    executionLogs: result.executionLog ? [{
      title: "Architect merge handling",
      content: result.executionLog,
      createdAt: new Date().toISOString(),
      status: "ok"
    }] : [],
    messages: [
      { role: "user", content, createdAt: now },
      { role: "assistant", content: result.text, createdAt: new Date().toISOString() }
    ]
  });

  return { text: result.text };
}
