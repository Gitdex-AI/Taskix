import { PageTitle } from "@/components/PageTitle";
import { CodexStatusPanel } from "@/components/CodexStatusPanel";
import { GhStatusPanel } from "@/components/GhStatusPanel";

export default function ToolsPage() {
  return (
    <>
      <PageTitle title="Tools" />
      <CodexStatusPanel />
      <GhStatusPanel />
    </>
  );
}
