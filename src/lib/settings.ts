import { getJsonValue, setJsonValue } from "@/lib/db";
import os from "node:os";
import path from "node:path";
import { dataDir } from "@/lib/paths";
import type { Settings } from "@/lib/types";

const legacyCodexHome = `${dataDir}/codex-home`;
const defaultCodexHome = path.join(os.homedir(), ".codex");

const defaults: Settings = {
  appBaseUrl: "http://localhost:8000",
  telegramBotToken: "",
  telegramWebhookSecret: "",
  codexBin: "codex",
  codexHome: defaultCodexHome,
  codexModel: "gpt-5.4",
  codexSandbox: "workspace-write",
  codexApprovalPolicy: "never",
  githubToken: "",
  githubRepo: "",
  githubApiUrl: "https://api.github.com",
  githubUsername: "",
  githubSshPrivateKeyPath: "",
  githubSshPublicKey: ""
};

export async function getSettings(): Promise<Settings> {
  const runtime = getJsonValue<Partial<Settings>>("settings");
  const settings = { ...defaults, ...fromEnv(), ...runtime };
  const codexHome = !settings.codexHome || settings.codexHome === legacyCodexHome ? defaultCodexHome : settings.codexHome;
  return { ...settings, codexHome };
}

export async function saveSettings(settings: Settings): Promise<void> {
  setJsonValue("settings", settings);
}

function fromEnv(): Partial<Settings> {
  return compact({
    appBaseUrl: process.env.APP_BASE_URL,
    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
    telegramWebhookSecret: process.env.TELEGRAM_WEBHOOK_SECRET,
    codexBin: process.env.CODEX_BIN,
    codexHome: process.env.CODEX_HOME,
    codexModel: process.env.CODEX_MODEL,
    codexSandbox: process.env.CODEX_SANDBOX,
    codexApprovalPolicy: process.env.CODEX_APPROVAL_POLICY,
    githubToken: process.env.GITHUB_TOKEN,
    githubRepo: process.env.GITHUB_REPO,
    githubApiUrl: process.env.GITHUB_API_URL,
    githubUsername: process.env.GITHUB_USERNAME,
    githubSshPrivateKeyPath: process.env.GITHUB_SSH_PRIVATE_KEY_PATH,
    githubSshPublicKey: process.env.GITHUB_SSH_PUBLIC_KEY
  });
}

function compact<T extends Record<string, string | undefined>>(input: T): Partial<Settings> {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== undefined && value !== "")) as Partial<Settings>;
}
