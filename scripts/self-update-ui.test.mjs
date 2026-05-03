import assert from "node:assert/strict";
import { test } from "node:test";

import {
  deriveSelfUpdateDialogModel,
  deriveSelfUpdatePollDecision
} from "../src/lib/self-update-ui.ts";

test("self-update dialog disables duplicate submissions during running phases", () => {
  for (const phase of ["loading", "updating", "restarting", "polling"]) {
    const model = deriveSelfUpdateDialogModel({
      phase,
      status: enabledStatus()
    });

    assert.equal(model.actionDisabled, true);
    assert.equal(model.canSubmit, false);
  }
});

test("self-update dialog exposes in-dialog restart confirmation when restart is available", () => {
  const model = deriveSelfUpdateDialogModel({
    phase: "confirm-restart",
    status: { ...enabledStatus(), restartAvailable: true, operatorSubmissionAvailable: false, operatorIntentToken: null }
  });

  assert.equal(model.canSubmit, true);
  assert.equal(model.canCancelRestart, true);
  assert.equal(model.canConfirmRestart, true);
  assert.match(model.message, /Confirm restart/);
});

test("self-update dialog does not confirm restart when restart is unavailable", () => {
  const model = deriveSelfUpdateDialogModel({
    phase: "confirm-restart",
    status: enabledStatus()
  });

  assert.equal(model.canCancelRestart, true);
  assert.equal(model.canConfirmRestart, false);
});

test("self-update dialog returns cancelable confirmation to idle restart-available state", () => {
  const confirming = deriveSelfUpdateDialogModel({
    phase: "confirm-restart",
    status: { ...enabledStatus(), restartAvailable: true, operatorSubmissionAvailable: false, operatorIntentToken: null }
  });
  const idle = deriveSelfUpdateDialogModel({
    phase: "idle",
    status: { ...enabledStatus(), restartAvailable: true, operatorSubmissionAvailable: false, operatorIntentToken: null }
  });

  assert.equal(confirming.canCancelRestart, true);
  assert.equal(idle.canConfirmRestart, false);
  assert.equal(idle.canSubmit, true);
  assert.match(idle.message, /Restart is available/);
});

test("self-update dialog allows submission only when server integration and operator submission are enabled", () => {
  assert.equal(deriveSelfUpdateDialogModel({ phase: "idle", status: enabledStatus() }).canSubmit, true);
  assert.equal(deriveSelfUpdateDialogModel({ phase: "idle", status: { ...enabledStatus(), enabled: false } }).canSubmit, false);
  assert.equal(
    deriveSelfUpdateDialogModel({ phase: "idle", status: { ...enabledStatus(), operatorSubmissionAvailable: false } }).canSubmit,
    false
  );
});

test("self-update dialog allows restart confirmation after update without a fresh update intent", () => {
  const model = deriveSelfUpdateDialogModel({
    phase: "idle",
    status: { ...enabledStatus(), operatorSubmissionAvailable: false, operatorIntentToken: null, restartAvailable: true }
  });

  assert.equal(model.canSubmit, true);
  assert.match(model.message, /Restart is available/);
});

test("self-update polling continues when status responds with the pre-restart boot marker", () => {
  const decision = deriveSelfUpdatePollDecision({
    responseOk: true,
    status: enabledStatus(),
    initialBootId: "boot-before",
    elapsedMs: 2_000,
    timeoutMs: 60_000
  });

  assert.equal(decision.phase, "polling");
  assert.equal(decision.shouldContinue, true);
});

test("self-update polling stops on a changed boot marker", () => {
  const decision = deriveSelfUpdatePollDecision({
    responseOk: true,
    status: { ...enabledStatus(), bootId: "boot-after" },
    initialBootId: "boot-before",
    elapsedMs: 2_000,
    timeoutMs: 60_000
  });

  assert.equal(decision.phase, "success");
  assert.equal(decision.shouldContinue, false);
});

test("self-update polling treats a changed boot marker as success at the timeout boundary", () => {
  const decision = deriveSelfUpdatePollDecision({
    responseOk: true,
    status: { ...enabledStatus(), bootId: "boot-after" },
    initialBootId: "boot-before",
    elapsedMs: 60_000,
    timeoutMs: 60_000
  });

  assert.equal(decision.phase, "success");
  assert.equal(decision.shouldContinue, false);
});

test("self-update polling continues through temporary unavailable responses", () => {
  const decision = deriveSelfUpdatePollDecision({
    responseOk: false,
    status: null,
    initialBootId: "boot-before",
    elapsedMs: 10_000,
    timeoutMs: 60_000
  });

  assert.equal(decision.phase, "polling");
  assert.equal(decision.shouldContinue, true);
});

test("self-update polling stops at bounded timeout", () => {
  const decision = deriveSelfUpdatePollDecision({
    responseOk: false,
    status: null,
    initialBootId: "boot-before",
    elapsedMs: 60_000,
    timeoutMs: 60_000
  });

  assert.equal(decision.phase, "timeout");
  assert.equal(decision.shouldContinue, false);
});

test("self-update polling reports terminal restart failure distinctly", () => {
  const decision = deriveSelfUpdatePollDecision({
    responseOk: true,
    status: { ...enabledStatus(), restartStatus: "failed", restartError: "restart failed" },
    initialBootId: "boot-before",
    elapsedMs: 2_000,
    timeoutMs: 60_000
  });

  assert.equal(decision.phase, "failure");
  assert.equal(decision.shouldContinue, false);
  assert.match(decision.message, /restart failed/);
});

function enabledStatus() {
  return {
    enabled: true,
    restartAvailable: false,
    lastRun: null,
    trustedCallerAddressAvailable: true,
    trustedLocalhostCallerValidated: true,
    operatorSubmissionAvailable: true,
    operatorIntentToken: "intent-token",
    bootId: "boot-before",
    startedAt: "2026-05-02T00:00:00.000Z",
    restartStatus: "idle",
    restartError: null
  };
}
