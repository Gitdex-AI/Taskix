import { ToolsPanel } from "@/components/ToolsPanel";
import { requireConsolePageAuth } from "@/lib/console-auth";

export default async function ToolsPage() {
  await requireConsolePageAuth("/tools");
  return <ToolsPanel />;
}
