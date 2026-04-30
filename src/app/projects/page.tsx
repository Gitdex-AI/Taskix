import { Alert, Button, Group, Paper, Text } from "@mantine/core";
import { FolderPlus, Info } from "lucide-react";
import { PageTitle } from "@/components/PageTitle";
import { ProjectsTable } from "@/components/Tables";
import { listProjects } from "@/lib/store";

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ message?: string; error?: string }> }) {
  const [{ message, error }, projects] = await Promise.all([searchParams, listProjects()]);

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
        <ProjectsTable projects={projects} />
      </Paper>
    </>
  );
}
