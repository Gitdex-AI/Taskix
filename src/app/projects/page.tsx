import { redirect } from "next/navigation";
import { requireConsolePageAuth } from "@/lib/console-auth";
import { listProjects } from "@/lib/store";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
  const { message, error } = await searchParams;
  await requireConsolePageAuth(buildProjectsNextPath({ message, error }));
  const projects = await listProjects();
  const latestProject = projects
    .slice()
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))[0];

  if (latestProject) {
    redirect(`/projects/${latestProject.projectId}${buildQuery({ message, error })}`);
  }

  redirect(`/projects/new${buildQuery({ error: error ?? message })}`);
}

function buildProjectsNextPath({ message, error }: { message?: string; error?: string }): string {
  const params = new URLSearchParams();
  if (message) params.set("message", message);
  if (error) params.set("error", error);
  const query = params.toString();
  return query ? `/projects?${query}` : "/projects";
}

function buildQuery({ message, error }: { message?: string; error?: string }): string {
  const params = new URLSearchParams();
  if (message) params.set("message", message);
  if (error) params.set("error", error);
  const query = params.toString();
  return query ? `?${query}` : "";
}
