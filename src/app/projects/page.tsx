import { Alert, Button, Group, Paper, Text } from "@mantine/core";
import { FolderPlus, Info } from "lucide-react";
import { PageTitle } from "@/components/PageTitle";
import { ProjectsTable } from "@/components/Tables";
import { requireConsolePageAuth } from "@/lib/console-auth";
import { listProjects, listWorkflows } from "@/lib/store";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
  const { message, error } = await searchParams;
  await requireConsolePageAuth(buildProjectsNextPath({ message, error }));
  const [projects, workflows] = await Promise.all([listProjects(), listWorkflows()]);
  const latestWorkflowByProject = new Map<string, string>();
  for (const workflow of workflows) {
    if (!workflow.projectId) continue;
    const current = latestWorkflowByProject.get(workflow.projectId);
    if (!current || workflow.createdAt > current) latestWorkflowByProject.set(workflow.projectId, workflow.createdAt);
  }
  const projectsWithLatest = projects
    .map((project) => ({
      ...project,
      latestAt: latestWorkflowByProject.get(project.projectId) ?? project.createdAt
    }))
    .sort((a, b) => b.latestAt.localeCompare(a.latestAt));

  return (
    <>
      <PageTitle title="Projects" />
      {(message || error) && (
        <Alert color={error ? "red" : "blue"} icon={<Info size={16} />} mb="md">
          {message ?? error}
        </Alert>
      )}
      <Paper>
        <Group justify="space-between" p="md" className="section-header">
          <div>
            <Text fw={760}>Projects</Text>
            <Text size="sm" c="dimmed">
              Telegram users switch context with /use &lt;slug&gt;
            </Text>
          </div>
          <Button component="a" href="/projects/new" leftSection={<FolderPlus size={16} />}>
            Add Project
          </Button>
        </Group>
        <ProjectsTable projects={projectsWithLatest} />
      </Paper>
    </>
  );
}

function buildProjectsNextPath({ message, error }: { message?: string; error?: string }): string {
  const params = new URLSearchParams();
  if (message) params.set("message", message);
  if (error) params.set("error", error);
  const query = params.toString();
  return query ? `/projects?${query}` : "/projects";
}
