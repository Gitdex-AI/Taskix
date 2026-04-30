import { runWorkflow, runWorkflowIssue, syncWorkflowFromGitHub } from "@/lib/orchestrator";
import { claimNextPendingJob, getProject, getWorkflow, saveJob } from "@/lib/store";
import type { JobRecord } from "@/lib/types";

export async function runNextJob(projectId?: string): Promise<{ job: JobRecord | null; ran: boolean }> {
  const job = await claimNextPendingJob(projectId);
  if (!job) return { job: null, ran: false };

  try {
    if (job.type === "workflow_run" || job.type === "issue_run") {
      const project = job.projectId ? await getProject(job.projectId) : null;
      const workflow = await getWorkflow(job.payload.workflowId);
      if (workflow?.paused) {
        job.status = "pending";
        job.error = "Workflow is paused";
        job.updatedAt = new Date().toISOString();
        await saveJob(job);
        return { job, ran: false };
      }
      if (job.type === "issue_run" && job.payload.issueId) {
        await runWorkflowIssue(job.payload.workflowId, job.payload.issueId, project);
      } else {
        await runWorkflow(job.payload.workflowId, project);
      }
      await syncWorkflowFromGitHub(job.payload.workflowId, project);
    }
    job.status = "done";
    job.error = null;
  } catch (error) {
    job.status = "failed";
    job.error = error instanceof Error ? error.message : "Unknown job failure";
  }

  job.updatedAt = new Date().toISOString();
  await saveJob(job);
  return { job, ran: true };
}
