import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canAutoRunDeveloper, canAutoRunQa } from "../src/lib/auto-run-policy.ts";
import { hasSuccessfulDeveloperRetryAfterReturnBlocker, shouldReturnFailedJobToDeveloper } from "../src/lib/auto-run-return-policy.ts";

const issue = (overrides = {}) => ({
  title: "Issue",
  description: "Issue",
  assigneeRole: "developer",
  acceptanceCriteria: [],
  issueId: "issue-1",
  githubState: "OPEN",
  prState: "OPEN",
  prUrl: "https://github.com/Gitdex-AI/gitdex/pull/1",
  labels: [],
  prLabels: [],
  ...overrides
});

const workflow = (issueRecord = issue()) => ({
  workflowId: "workflow-1",
  projectId: "project-1",
  issues: [issueRecord]
});

const job = (overrides = {}) => ({
  jobId: `job-${Math.random()}`,
  projectId: "project-1",
  type: "issue_run",
  status: "done",
  createdAt: "2026-05-04T00:00:00.000Z",
  updatedAt: "2026-05-04T00:00:00.000Z",
  payload: { workflowId: "workflow-1", issueId: "issue-1" },
  ...overrides
});

describe("canAutoRunQa", () => {
  it("allows QA-stage issues to start QA", () => {
    assert.equal(canAutoRunQa(issue({ labels: ["gd:qa"] })), true);
  });

  it("does not start QA while QA is already running", () => {
    assert.equal(canAutoRunQa(issue({ labels: ["gd:blocked"] })), false);
  });

  it("does not start QA for closed PRs", () => {
    assert.equal(canAutoRunQa(issue({ prState: "CLOSED" })), false);
  });

  it("does not restart QA for environment-blocked issues", () => {
    assert.equal(canAutoRunQa(issue({ labels: ["gd:blocked"] })), false);
  });

  it("does not start QA for PRs returned for rebase", () => {
    assert.equal(canAutoRunQa(issue({ labels: ["gd:rebase"] })), false);
  });
});

describe("canAutoRunDeveloper", () => {
  it("allows open dev-stage issues without a PR", () => {
    assert.equal(canAutoRunDeveloper(issue({ prUrl: null, prState: null, labels: ["gd:dev"] })), true);
  });

  it("does not start developer work for blocked issues", () => {
    assert.equal(canAutoRunDeveloper(issue({ prUrl: null, prState: null, labels: ["gd:blocked"] })), false);
  });

  it("does not start developer work for spec-blocked issues", () => {
    assert.equal(canAutoRunDeveloper(issue({ prUrl: null, prState: null, labels: ["gd:architect"] })), false);
  });

  it("does not start developer work for environment-blocked issues", () => {
    assert.equal(canAutoRunDeveloper(issue({ prUrl: null, prState: null, labels: ["gd:blocked"] })), false);
  });

  it("does not treat rebase-required PRs as fresh developer work", () => {
    assert.equal(canAutoRunDeveloper(issue({ prUrl: null, prState: null, labels: ["gd:rebase"] })), false);
  });
});

describe("stale failed return jobs", () => {
  it("ignores failed review or merge jobs once a newer developer retry succeeded", () => {
    const issueRecord = issue({ labels: ["gd:fix"] });
    const workflowRecord = workflow(issueRecord);
    const jobs = [
      job({
        jobId: "review-failed",
        type: "architect_review_run",
        status: "failed",
        updatedAt: "2026-05-04T01:00:00.000Z"
      }),
      job({
        jobId: "developer-done",
        type: "issue_run",
        status: "done",
        updatedAt: "2026-05-04T01:05:00.000Z"
      })
    ];

    assert.equal(shouldReturnFailedJobToDeveloper(issueRecord, workflowRecord, jobs), false);
    assert.equal(hasSuccessfulDeveloperRetryAfterReturnBlocker(issueRecord, workflowRecord, jobs), true);
  });

  it("returns to developer when review failed and no newer developer retry completed", () => {
    const issueRecord = issue({ labels: ["gd:fix"] });
    const workflowRecord = workflow(issueRecord);
    const jobs = [
      job({
        jobId: "developer-old",
        type: "issue_run",
        status: "done",
        updatedAt: "2026-05-04T00:55:00.000Z"
      }),
      job({
        jobId: "review-failed",
        type: "architect_review_run",
        status: "failed",
        updatedAt: "2026-05-04T01:00:00.000Z"
      })
    ];

    assert.equal(shouldReturnFailedJobToDeveloper(issueRecord, workflowRecord, jobs), true);
    assert.equal(hasSuccessfulDeveloperRetryAfterReturnBlocker(issueRecord, workflowRecord, jobs), false);
  });

  it("treats a newer developer retry after failed QA as ready for QA recheck", () => {
    const issueRecord = issue({ labels: ["gd:fix"] });
    const workflowRecord = workflow(issueRecord);
    const jobs = [
      job({
        jobId: "qa-failed",
        type: "qa_run",
        status: "failed",
        updatedAt: "2026-05-04T01:00:00.000Z"
      }),
      job({
        jobId: "developer-done",
        type: "issue_run",
        status: "done",
        updatedAt: "2026-05-04T01:05:00.000Z"
      })
    ];

    assert.equal(hasSuccessfulDeveloperRetryAfterReturnBlocker(issueRecord, workflowRecord, jobs), true);
  });
});
