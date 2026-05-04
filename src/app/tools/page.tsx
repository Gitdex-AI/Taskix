import { ToolsPanel } from "@/components/ToolsPanel";
import { ToolsReturnControl } from "@/components/tools/ToolsReturnControls";
import { requireConsolePageAuth } from "@/lib/console-auth";
import { listProjects } from "@/lib/store";

export default async function ToolsPage() {
  await requireConsolePageAuth("/tools");
  const projects = await listProjects();
  const recentProjectChats = projects.map(({ projectId, createdAt }) => ({ projectId, createdAt }));

  return <ToolsPanel headerActions={<ToolsReturnControl recentProjectChats={recentProjectChats} />} />;
}
