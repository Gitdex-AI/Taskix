import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getMissingRequiredSettings,
  settingsMetadata,
  settingsMetadataByKey,
  settingsMetadataGroups
} from "../src/lib/settings-metadata.ts";

const settingsKeys = [
  "appBaseUrl",
  "telegramBotToken",
  "telegramWebhookSecret",
  "codexBin",
  "codexHome",
  "codexModel",
  "codexSandbox",
  "codexApprovalPolicy",
  "githubToken",
  "githubRepo",
  "githubApiUrl",
  "worktreeRetentionDays",
  "autoCleanupCompletedWorktrees",
  "rebuildWorktreeOnEnvironmentBlocked"
];

const requiredForGithubPrWorkflow = [
  "codexBin",
  "codexHome",
  "codexModel",
  "codexSandbox",
  "codexApprovalPolicy",
  "githubToken",
  "githubRepo",
  "githubApiUrl"
];

describe("settings metadata", () => {
  it("represents every settings-page parameter exactly once", () => {
    const metadataKeys = settingsMetadata.map((setting) => setting.key);

    assert.deepEqual([...metadataKeys].sort(), [...settingsKeys].sort());
    assert.equal(new Set(metadataKeys).size, settingsKeys.length);
    for (const key of settingsKeys) {
      assert.equal(settingsMetadataByKey[key].key, key);
    }
  });

  it("groups settings by functional area with prompt-ready labels and explanations", () => {
    assert.deepEqual(
      settingsMetadataGroups.map((group) => group.id),
      ["runtime", "telegram", "codex", "github", "worktrees"]
    );

    for (const group of settingsMetadataGroups) {
      assert.ok(group.label);
      assert.ok(group.description);
      assert.ok(group.settings.length > 0);

      for (const setting of group.settings) {
        assert.ok(setting.label);
        assert.match(setting.requirement, /^(required|optional)$/);
        assert.ok(setting.purpose.length >= 20);
        assert.ok(setting.behaviorImpact.length >= 20);
      }
    }
  });

  it("marks only the minimum GitHub PR workflow configuration as required", () => {
    const requiredKeys = settingsMetadata.filter((setting) => setting.requirement === "required").map((setting) => setting.key);
    const optionalKeys = settingsMetadata.filter((setting) => setting.requirement === "optional").map((setting) => setting.key);

    assert.deepEqual([...requiredKeys].sort(), [...requiredForGithubPrWorkflow].sort());
    assert.equal(optionalKeys.includes("appBaseUrl"), true);
    assert.equal(optionalKeys.includes("telegramBotToken"), true);
    assert.equal(optionalKeys.includes("worktreeRetentionDays"), true);
  });

  it("returns prompt-ready missing required settings for incomplete configuration", () => {
    const missing = getMissingRequiredSettings({
      codexBin: "codex",
      codexHome: " ",
      codexModel: "gpt-5.4",
      codexSandbox: "workspace-write",
      codexApprovalPolicy: "never",
      githubRepo: "",
      githubApiUrl: "https://api.github.com",
      appBaseUrl: "",
      telegramBotToken: "",
      worktreeRetentionDays: 7
    });

    assert.deepEqual(
      missing.map((setting) => setting.key),
      ["codexHome", "githubRepo", "githubToken"]
    );
    assert.deepEqual(
      missing.map((setting) => setting.groupLabel),
      ["Codex", "GitHub", "GitHub"]
    );
    for (const setting of missing) {
      assert.equal(setting.requirement, "required");
      assert.ok(setting.label);
      assert.ok(setting.purpose);
      assert.ok(setting.behaviorImpact);
    }
  });

  it("does not report missing required settings for complete GitHub PR workflow configuration", () => {
    const missing = getMissingRequiredSettings({
      codexBin: "codex",
      codexHome: "/Users/example/.codex",
      codexModel: "gpt-5.4",
      codexSandbox: "workspace-write",
      codexApprovalPolicy: "never",
      githubRepo: "Gitdex-AI/gitdex",
      githubApiUrl: "https://api.github.com",
      githubToken: "ghp_example"
    });

    assert.deepEqual(missing, []);
  });
});
