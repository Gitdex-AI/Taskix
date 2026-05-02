import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isIssueSpecBlocked, normalizeQaFailureType } from "../src/lib/spec-blocker.ts";

describe("QA spec blocker classification", () => {
  it("reclassifies NextRequest caller-address contradictions as spec blockers", () => {
    const result = normalizeQaFailureType({
      passed: false,
      failureType: "implementation",
      summary: "Baseline checks passed, but route-shaped localhost requests are rejected.",
      findings: [
        "The API routes pass NextRequest into selfUpdateGuard, but this Next.js runtime exposes neither ip nor remoteAddress on NextRequest. Expected: real localhost route callers are accepted while spoofable Host headers are not trusted."
      ],
      labelsApplied: [],
      testsRun: []
    });

    assert.equal(result, "spec");
  });

  it("lets the project issue row show architect escalation for existing QA comments", () => {
    assert.equal(isIssueSpecBlocked(
      { labels: ["taskix:qa-failed"], prLabels: [] },
      {
        messages: [{
          role: "assistant",
          createdAt: new Date().toISOString(),
          content: "Failure type: implementation\nNextRequest runtime-address probe confirmed ip and remoteAddress are absent. localhost route callers are rejected."
        }]
      }
    ), true);
  });
});
