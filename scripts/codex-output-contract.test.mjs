import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const source = await readFile(new URL("../src/lib/codex.ts", import.meta.url), "utf8");

function functionBody(name) {
  const start = source.indexOf(`private async ${name}`);
  assert.notEqual(start, -1, `${name} should exist`);
  const nextPrivate = source.indexOf("\n  private async ", start + 1);
  return source.slice(start, nextPrivate === -1 ? undefined : nextPrivate);
}

test("JSON-schema Codex runs do not request stdout sentinel output", () => {
  const body = functionBody("runJsonResult");

  assert.match(body, /"--output-schema"[\s\S]*schemaPath/);
  assert.doesNotMatch(body, /withAgentFinalInstruction\(prompt\)/);
  assert.match(body, /outputPath,\s*\n\s*"-"\s*\n\s*\]/);
  assert.match(body, /stdin: prompt/);
});

test("text Codex runs keep the stdout sentinel completion protocol", () => {
  const body = functionBody("runText");

  assert.match(body, /withAgentFinalInstruction\(prompt\)/);
});

test("Codex child processes are detached and registered for shutdown cleanup", () => {
  const body = functionBody("runCodex");

  assert.match(body, /ensureCodexShutdownHandlers\(\);/);
  assert.match(body, /detached: true/);
  assert.match(body, /registerCodexChild\(child\);/);
  assert.match(body, /terminateCodexChild\(child\.pid, child, "SIGTERM"\)/);
});

test("server shutdown kills the active Codex process group", () => {
  assert.match(source, /process\.once\("SIGINT", \(\) => shutdownCodexChildrenAndExit\("SIGINT"\)\);/);
  assert.match(source, /process\.once\("SIGTERM", \(\) => shutdownCodexChildrenAndExit\("SIGTERM"\)\);/);
  assert.match(source, /terminateActiveCodexChildren\("SIGKILL"\);/);
  assert.match(source, /process\.kill\(-pid, signal\);/);
});
