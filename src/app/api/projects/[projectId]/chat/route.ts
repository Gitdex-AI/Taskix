import { NextResponse } from "next/server";
import { CodexClient } from "@/lib/codex";
import { getSettings } from "@/lib/settings";
import { appendAgentMessages, getAgentSession, getProject, saveProject } from "@/lib/store";
import type { Role } from "@/lib/types";

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const form = await request.formData();
  const role = String(form.get("role") ?? "product_manager") as Role;
  const message = String(form.get("message") ?? "").trim();
  if (!message) return redirect(request, `/projects/${projectId}?role=${role}&error=${encodeURIComponent("Message is required.")}`);
  if (role !== "product_manager" && role !== "architect" && role !== "devops") {
    return redirect(request, `/projects/${projectId}?error=${encodeURIComponent("Only PM, architect, and DevOps chat are supported here.")}`);
  }

  const [project, settings] = await Promise.all([getProject(projectId), getSettings()]);
  if (!project) return redirect(request, `/projects?error=${encodeURIComponent("Project not found.")}`);

  const sessionKey = `${project.projectId}:${role}`;
  const existing = await getAgentSession(sessionKey);
  const codex = new CodexClient(settings);
  const currentSessionId = role === "product_manager" ? project.projectManagerSessionId : role === "architect" ? project.architectSessionId : project.devopsSessionId;
  const result = role === "product_manager"
    ? await codex.projectManagerChat({ projectName: project.name, githubRepo: project.githubRepo, message, sessionId: currentSessionId ?? existing?.sessionId })
    : role === "architect"
      ? await codex.architectChat({ projectName: project.name, githubRepo: project.githubRepo, message, sessionId: currentSessionId ?? existing?.sessionId })
      : await codex.devopsChat({ projectName: project.name, githubRepo: project.githubRepo, message, sessionId: currentSessionId ?? existing?.sessionId });

  if (role === "product_manager" && result.sessionId && result.sessionId !== project.projectManagerSessionId) {
    project.projectManagerSessionId = result.sessionId;
    await saveProject(project);
  }
  if (role === "architect" && result.sessionId && result.sessionId !== project.architectSessionId) {
    project.architectSessionId = result.sessionId;
    await saveProject(project);
  }
  if (role === "devops" && result.sessionId && result.sessionId !== project.devopsSessionId) {
    project.devopsSessionId = result.sessionId;
    await saveProject(project);
  }

  const now = new Date().toISOString();
  await appendAgentMessages({
    sessionKey,
    projectId: project.projectId,
    role,
    title: role === "product_manager" ? "Project Manager" : role === "architect" ? "Architect" : "DevOps",
    sessionId: result.sessionId ?? currentSessionId ?? existing?.sessionId ?? null,
    messages: [
      { role: "user", content: message, createdAt: now },
      { role: "assistant", content: result.text, createdAt: new Date().toISOString() }
    ]
  });

  return redirect(request, `/projects/${project.projectId}?role=${role}`);
}

function redirect(request: Request, location: string): NextResponse {
  return NextResponse.redirect(new URL(location, request.url), { status: 303 });
}
