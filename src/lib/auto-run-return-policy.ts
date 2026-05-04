import type { IssueRecord, JobRecord, WorkflowRecord } from "./types.ts";

export function shouldReturnFailedJobToDeveloper(issue: IssueRecord, workflow: WorkflowRecord, jobs: JobRecord[]): boolean {
  const latest = latestReturnBlockerJob(issue, workflow, jobs, ["architect_review_run", "merge_run"]);
  if (latest && hasSuccessfulDeveloperJobAfter(issue, workflow, jobs, Date.parse(latest.updatedAt))) return false;
  return Boolean(issue.prUrl) && !isClosedIssue(issue) && issue.prState !== "MERGED" && latest?.status === "failed";
}

export function hasSuccessfulDeveloperRetryAfterReturnBlocker(issue: IssueRecord, workflow: WorkflowRecord, jobs: JobRecord[]): boolean {
  const latest = latestReturnBlockerJob(issue, workflow, jobs, ["qa_run", "architect_review_run", "merge_run"]);
  return Boolean(latest && hasSuccessfulDeveloperJobAfter(issue, workflow, jobs, Date.parse(latest.updatedAt)));
}

function latestReturnBlockerJob(issue: IssueRecord, workflow: WorkflowRecord, jobs: JobRecord[], types: JobRecord["type"][]): JobRecord | null {
  return jobs
    .filter((job) => (
      job.payload.workflowId === workflow.workflowId
      && job.payload.issueId === issue.issueId
      && types.includes(job.type)
      && job.status === "failed"
    ))
    .sort((left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt))[0] ?? null;
}

function hasSuccessfulDeveloperJobAfter(issue: IssueRecord, workflow: WorkflowRecord, jobs: JobRecord[], timestamp: number): boolean {
  return jobs.some((job) => (
    job.payload.workflowId === workflow.workflowId
    && job.payload.issueId === issue.issueId
    && job.type === "issue_run"
    && job.status === "done"
    && Date.parse(job.updatedAt) > timestamp
  ));
}

function isClosedIssue(issue: IssueRecord): boolean {
  return issue.githubState === "CLOSED" || issue.prState === "CLOSED" || issue.prState === "MERGED";
}
