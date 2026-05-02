import { notFound } from "next/navigation";
import { Badge, Button, Code, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { getProject, listProjectWorkflows } from "@/lib/store";
import type { WorkflowRecord } from "@/lib/types";

export default async function ProjectRequirementsPage({
  params
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  if (!project) notFound();

  const workflows = (await listProjectWorkflows(project.projectId)).sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <div>
          <Button component="a" href={`/projects/${project.projectId}?phase=requirements`} variant="subtle" size="compact-sm" leftSection={<ArrowLeft size={14} />}>
            Back to project
          </Button>
          <Group gap="sm" mt="sm">
            <Title order={1}>Requirements</Title>
            <Badge variant="light">{workflows.length} total</Badge>
          </Group>
          <Text c="dimmed" size="sm">
            Numbered requirements for {project.name}.
          </Text>
        </div>
      </Group>

      <Paper>
        <Group justify="space-between" p="md" className="section-header">
          <div>
            <Text fw={760}>All Requirements</Text>
            <Text size="sm" c="dimmed">Requirement number, status, and linked workflow detail.</Text>
          </div>
        </Group>
        <Stack p="md" gap="xs">
          {workflows.length ? workflows.map((workflow) => (
            <RequirementListRow key={workflow.workflowId} projectId={project.projectId} workflow={workflow} />
          )) : (
            <Text size="sm" c="dimmed">No numbered requirements yet.</Text>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

function RequirementListRow({ projectId, workflow }: { projectId: string; workflow: WorkflowRecord }) {
  return (
    <a href={`/projects/${projectId}/workflows/${workflow.workflowId}`} className="requirement-row">
      <div className="requirement-row-body">
        <div className="requirement-row-main">
          <Group gap="xs">
            <Code>{workflow.trackingCode ?? workflow.workflowId}</Code>
            <Badge size="xs" variant="light">{workflow.status}</Badge>
            <Badge size="xs" variant="outline">{workflow.issues.length} issue{workflow.issues.length === 1 ? "" : "s"}</Badge>
          </Group>
          <Text size="sm" mt={6} lineClamp={2}>{workflow.userRequirement}</Text>
          <Text size="xs" c="dimmed" mt={4}>Created {formatDate(workflow.createdAt)}</Text>
        </div>
      </div>
    </a>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
