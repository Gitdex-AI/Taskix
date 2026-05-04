import type { WorkflowRecord } from "@/lib/types";

export function nextRequirementTrackingCodeFromWorkflows(
  workflows: Pick<WorkflowRecord, "projectId" | "trackingCode">[],
  projectId: string | null
): string {
  const prefix = "R";
  const next = workflows
    .filter((workflow) => projectId ? workflow.projectId === projectId : !workflow.projectId)
    .map((workflow) => workflow.trackingCode ?? "")
    .filter((code) => code.startsWith(prefix))
    .map((code) => Number(code.slice(prefix.length)))
    .filter(Number.isFinite)
    .reduce((max, value) => Math.max(max, value), 0) + 1;
  return `${prefix}${next}`;
}
