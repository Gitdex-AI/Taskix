export const developerRoleCatalog = [
  {
    id: "backend_developer",
    label: "Backend Developer",
    owns: "APIs, database schema, business logic, auth, validation, backend tests.",
    typicalPaths: ["src/app/api", "src/lib", "prisma", "db", "migrations"]
  },
  {
    id: "web_developer",
    label: "Web Developer",
    owns: "Web UI, frontend interactions, accessibility, responsiveness, client/server component boundaries.",
    typicalPaths: ["src/app", "src/components", "src/styles"]
  },
  {
    id: "app_developer",
    label: "App Developer",
    owns: "Mobile app behavior, platform integration, navigation, state handling, device testing.",
    typicalPaths: ["apps/mobile", "ios", "android"]
  },
  {
    id: "admin_developer",
    label: "Admin Developer",
    owns: "Admin workflows, internal dashboards, operator UX, permissions, data management screens.",
    typicalPaths: ["src/app/admin", "src/components/admin"]
  },
  {
    id: "devops_developer",
    label: "DevOps Developer",
    owns: "CI/CD, deployment config, environments, secrets, containers, observability, release safety.",
    typicalPaths: [".github", "Dockerfile", "deploy", "infra"]
  },
  {
    id: "data_developer",
    label: "Data Developer",
    owns: "Data models, migrations, pipelines, analytics events, data quality, backfills.",
    typicalPaths: ["data", "etl", "analytics", "migrations"]
  },
  {
    id: "general_developer",
    label: "General Developer",
    owns: "Small cross-cutting implementation tasks that do not fit a more specific catalog role.",
    typicalPaths: []
  }
] as const;

export type DeveloperRoleId = (typeof developerRoleCatalog)[number]["id"];

export const developerRoleIds = developerRoleCatalog.map((role) => role.id) as DeveloperRoleId[];

export function formatDeveloperRoleCatalog(): string {
  return developerRoleCatalog
    .map((role) => [
      `- ${role.id}: ${role.owns}`,
      role.typicalPaths.length ? `  Typical paths: ${role.typicalPaths.join(", ")}` : "  Typical paths: choose the narrowest ownedPaths required by the issue."
    ].join("\n"))
    .join("\n");
}

export function developerRoleProfile(roleId: string | null | undefined): string {
  const role = developerRoleCatalog.find((item) => item.id === roleId);
  return role
    ? `${role.label}: ${role.owns}\nTypical paths: ${role.typicalPaths.length ? role.typicalPaths.join(", ") : "use issue ownedPaths as source of truth."}`
    : "General Developer: use the GitHub issue and ownedPaths as the source of truth.";
}
