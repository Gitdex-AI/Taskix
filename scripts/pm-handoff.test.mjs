import assert from "node:assert/strict";
import test from "node:test";
import { parseReadyForPlannerPayload, parseStartNewRequirementAction } from "../src/lib/pm-handoff.ts";

test("parseReadyForPlannerPayload extracts only planner-ready PM handoffs", () => {
  const payload = parseReadyForPlannerPayload(`
\`\`\`json
{
  "status": "ready_for_planner",
  "requirement": "Add inline planner confirmation.",
  "constraints": ["Keep the chat flow direct."],
  "acceptanceCriteria": ["The PM confirmation button runs the planner."],
  "openQuestions": []
}
\`\`\`
`);

  assert.equal(payload?.status, "ready_for_planner");
  assert.equal(payload?.requirement, "Add inline planner confirmation.");
  assert.equal(parseReadyForPlannerPayload('{ "status": "ready_for_architect" }'), null);
});

test("parseStartNewRequirementAction extracts PM new requirement decisions", () => {
  const payload = parseStartNewRequirementAction(`
This looks separate.

\`\`\`json
{
  "status": "needs_user_decision",
  "action": "start_new_requirement",
  "reason": "The user is asking for a separate settings workflow.",
  "question": "This looks like a new requirement. How should I handle it?",
  "options": [
    { "id": "start_new_requirement", "label": "Start new requirement", "draftMessage": "Add settings return behavior." },
    { "id": "keep_current", "label": "Keep in current chat" },
    { "id": "clarify", "label": "Clarify first" }
  ]
}
\`\`\`
`);

  assert.equal(payload?.action, "start_new_requirement");
  assert.equal(payload?.options[0]?.draftMessage, "Add settings return behavior.");
});
