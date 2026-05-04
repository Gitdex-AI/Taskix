import assert from "node:assert/strict";
import test from "node:test";
import { nextRequirementTrackingCodeFromWorkflows } from "../src/lib/requirement-tracking-code.ts";

test("requirement tracking codes use short project-scoped R numbers", () => {
  const workflows = [
    workflow({ projectId: "project-a", trackingCode: "R1" }),
    workflow({ projectId: "project-a", trackingCode: "R2" }),
    workflow({ projectId: "project-a", trackingCode: "WF-20260501-001" }),
    workflow({ projectId: "project-b", trackingCode: "R1" }),
    workflow({ projectId: "project-a", trackingCode: null })
  ];

  assert.equal(nextRequirementTrackingCodeFromWorkflows(workflows, "project-a"), "R3");
  assert.equal(nextRequirementTrackingCodeFromWorkflows(workflows, "project-b"), "R2");
  assert.equal(nextRequirementTrackingCodeFromWorkflows(workflows, "project-c"), "R1");
});

function workflow(overrides = {}) {
  return {
    projectId: "project-a",
    trackingCode: null,
    ...overrides
  };
}
