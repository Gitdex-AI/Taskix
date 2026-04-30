import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { chatProjectsDir, dataDir, databasePath, projectsDir, runtimeConfigPath, workflowsDir } from "@/lib/paths";

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (db) return db;

  mkdirSync(dataDir, { recursive: true });
  db = new DatabaseSync(databasePath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS kv (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS projects (
      project_id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      created_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS workflows (
      workflow_id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS chat_projects (
      chat_id INTEGER PRIMARY KEY,
      project_id TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS agent_sessions (
      session_key TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      role TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS jobs (
      job_id TEXT PRIMARY KEY,
      project_id TEXT,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );
  `);
  migrateJsonData(db);
  return db;
}

export function getJsonValue<T>(key: string): T | null {
  const row = getDb().prepare("SELECT value FROM kv WHERE key = ?").get(key) as { value: string } | undefined;
  return row ? (JSON.parse(row.value) as T) : null;
}

export function setJsonValue<T>(key: string, value: T): void {
  getDb()
    .prepare("INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value")
    .run(key, JSON.stringify(value));
}

function migrateJsonData(database: DatabaseSync): void {
  const migrated = database.prepare("SELECT value FROM kv WHERE key = ?").get("json_migration_done");
  if (migrated) return;

  const insertKv = database.prepare("INSERT OR IGNORE INTO kv (key, value) VALUES (?, ?)");
  const insertProject = database.prepare("INSERT OR IGNORE INTO projects (project_id, slug, created_at, payload) VALUES (?, ?, ?, ?)");
  const insertWorkflow = database.prepare("INSERT OR IGNORE INTO workflows (workflow_id, created_at, payload) VALUES (?, ?, ?)");
  const insertChatProject = database.prepare("INSERT OR IGNORE INTO chat_projects (chat_id, project_id) VALUES (?, ?)");

  database.exec("BEGIN");
  try {
    const runtimeConfig = readJsonFile<unknown>(runtimeConfigPath);
    if (runtimeConfig) insertKv.run("settings", JSON.stringify(runtimeConfig));

    for (const project of readJsonDir<Record<string, unknown>>(projectsDir)) {
      if (typeof project.projectId === "string" && typeof project.slug === "string") {
        insertProject.run(project.projectId, project.slug, String(project.createdAt ?? new Date().toISOString()), JSON.stringify(project));
      }
    }

    for (const workflow of readJsonDir<Record<string, unknown>>(workflowsDir)) {
      if (typeof workflow.workflowId === "string") {
        insertWorkflow.run(workflow.workflowId, String(workflow.createdAt ?? new Date().toISOString()), JSON.stringify(workflow));
      }
    }

    for (const binding of readJsonDir<{ chatId?: unknown; projectId?: unknown }>(chatProjectsDir)) {
      if (typeof binding.chatId === "number" && typeof binding.projectId === "string") {
        insertChatProject.run(binding.chatId, binding.projectId);
      }
    }

    insertKv.run("json_migration_done", JSON.stringify({ at: new Date().toISOString() }));
    database.exec("COMMIT");
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  }
}

function readJsonFile<T>(filePath: string): T | null {
  if (!existsSync(filePath)) return null;
  return JSON.parse(readFileSync(filePath, "utf8")) as T;
}

function readJsonDir<T>(dir: string): T[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => readJsonFile<T>(path.join(dir, file)))
    .filter((record): record is T => record !== null);
}
