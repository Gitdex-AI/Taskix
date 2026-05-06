import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeAgentSession } from "../src/lib/agent-session-sanitize.ts";

const baseSession = {
  sessionKey: "session-1",
  projectId: "project-1",
  role: "developer",
  title: "Developer",
  status: "blocked",
  sessionId: null,
  workflowId: "workflow-1",
  issueId: "R1-1",
  messages: [],
  updatedAt: "2026-05-06T00:00:00.000Z"
};

describe("agent session sanitization", () => {
  it("truncates oversized message content before persistence", () => {
    const largeContent = "x".repeat(13000);
    const session = sanitizeAgentSession({
      ...baseSession,
      messages: [{
        role: "assistant",
        content: largeContent,
        createdAt: "2026-05-06T00:00:00.000Z"
      }]
    });

    assert.ok(session.messages[0].content.length < largeContent.length);
    assert.match(session.messages[0].content, /truncated 1000 chars/);
  });

  it("truncates oversized inline execution logs before persistence", () => {
    const largeLog = "log\n".repeat(4000);
    const session = sanitizeAgentSession({
      ...baseSession,
      messages: [{
        role: "assistant",
        content: "done",
        createdAt: "2026-05-06T00:00:00.000Z",
        executionLogs: [{
          title: "execution",
          content: largeLog,
          createdAt: "2026-05-06T00:00:00.000Z",
          status: "failed"
        }]
      }]
    });

    const content = session.messages[0].executionLogs?.[0]?.content ?? "";
    assert.ok(content.length < largeLog.length);
    assert.match(content, /full output remains in job runtime logs/);
  });
});
