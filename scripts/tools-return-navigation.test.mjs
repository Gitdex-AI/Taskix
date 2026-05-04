import assert from "node:assert/strict";
import { test } from "node:test";
import {
  resolveConsoleReturnDestination
} from "../src/lib/return-navigation.ts";

test("tools return prefers known prior page state", () => {
  const destination = resolveConsoleReturnDestination({
    currentHref: "/tools",
    priorDestination: "/projects/project-a",
    recentProjectChats: [{ projectId: "project-b", latestAt: "2026-05-03T10:00:00.000Z" }]
  });

  assert.deepEqual(destination, {
    href: "/projects/project-a",
    source: "prior"
  });
});

test("tools return falls back to the most recent project chat", () => {
  const destination = resolveConsoleReturnDestination({
    currentHref: "/tools",
    recentProjectChats: [
      { projectId: "older", latestAt: "2026-05-01T10:00:00.000Z" },
      { projectId: "newer", latestAt: "2026-05-03T10:00:00.000Z" }
    ]
  });

  assert.deepEqual(destination, {
    href: "/projects/newer",
    source: "recent-project-chat"
  });
});
