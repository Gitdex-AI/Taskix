import { NextResponse } from "next/server";
import { CodexClient } from "@/lib/codex";
import { createWorkflow, formatWorkflow } from "@/lib/orchestrator";
import { getSettings } from "@/lib/settings";
import { createJob, getChatProject, getProjectBySlug, listProjects, saveProject, setChatProject } from "@/lib/store";
import { TelegramClient } from "@/lib/telegram";
import type { TelegramUpdate } from "@/lib/types";

export async function POST(request: Request) {
  const settings = await getSettings();
  if (settings.telegramWebhookSecret) {
    const received = request.headers.get("x-telegram-bot-api-secret-token");
    if (received !== settings.telegramWebhookSecret) return NextResponse.json({ error: "invalid telegram secret" }, { status: 401 });
  }

  const update = (await request.json()) as TelegramUpdate;
  const message = update.message;
  if (!message?.text) return NextResponse.json({ status: "ignored" });

  const text = message.text.trim();
  const chatId = Number(message.chat.id);
  const telegram = new TelegramClient(settings.telegramBotToken);

  if (text.startsWith("/start")) {
    await telegram.sendMessage(chatId, "Use /projects, /use <project_slug>, /current, /confirm <requirement>, and /status <workflow_id>.");
    return NextResponse.json({ status: "ok" });
  }

  if (text.startsWith("/projects")) {
    const projects = await listProjects();
    await telegram.sendMessage(
      chatId,
      projects.length ? ["Projects:", ...projects.map((project) => `- ${project.slug}: ${project.name} (${project.githubRepo})`)].join("\n") : "No projects yet. Add one in the web console."
    );
    return NextResponse.json({ status: "ok" });
  }

  if (text.startsWith("/use")) {
    const slug = text.split(/\s+/, 2)[1]?.trim();
    const project = slug ? await getProjectBySlug(slug) : null;
    if (!project) {
      await telegram.sendMessage(chatId, `Project not found: ${slug ?? ""}`);
      return NextResponse.json({ status: "ok" });
    }
    await setChatProject(chatId, project.projectId);
    await telegram.sendMessage(chatId, `Current project: ${project.name} (${project.slug})`);
    return NextResponse.json({ status: "ok" });
  }

  if (text.startsWith("/current")) {
    const project = await getChatProject(chatId);
    await telegram.sendMessage(
      chatId,
      project ? `Current project: ${project.name}\nRepo: ${project.githubRepo}\nAgents file: ${project.agentsFilePath ?? "AGENTS.md"}\nDeploy: ${project.autoDeploy ? "automatic after QA + architect approval" : "manual approval required"}\nPM session: ${project.projectManagerSessionId ?? "new"}` : "No project selected. Use /projects and /use <slug>."
    );
    return NextResponse.json({ status: "ok" });
  }

  const project = await getChatProject(chatId);
  if (!project) {
    await telegram.sendMessage(chatId, "Select a project first: /projects then /use <project_slug>.");
    return NextResponse.json({ status: "ok" });
  }

  if (text.startsWith("/confirm")) {
    const requirement = text.replace(/^\/confirm\s*/, "").trim();
    if (!requirement) {
      await telegram.sendMessage(chatId, "Usage: /confirm <confirmed requirement>");
      return NextResponse.json({ status: "ok" });
    }
    const workflow = await createWorkflow(requirement, chatId, project);
    await createJob({
      projectId: project.projectId,
      type: "workflow_run",
      payload: { workflowId: workflow.workflowId }
    });
    await telegram.sendMessage(chatId, `Created workflow ${workflow.trackingCode ?? workflow.workflowId} for ${project.name} and queued it for execution.`);
    await telegram.sendMessage(chatId, formatWorkflow(workflow));
    return NextResponse.json({ status: "ok" });
  }

  const codex = new CodexClient(settings);
  const pmResult = await codex.projectManagerChat({
    projectName: project.name,
    githubRepo: project.githubRepo,
    message: text,
    sessionId: project.projectManagerSessionId
  });
  if (pmResult.sessionId && pmResult.sessionId !== project.projectManagerSessionId) {
    project.projectManagerSessionId = pmResult.sessionId;
    await saveProject(project);
  }
  await telegram.sendMessage(chatId, pmResult.text);
  return NextResponse.json({ status: "ok" });
}
