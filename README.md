# Taskix

Taskix is a local-first orchestration server for running Codex-powered software teams.

It provides a web console and Telegram bot interface for turning a product request into a tracked workflow across fixed AI roles:

- Product Manager: clarifies requirements and keeps the user conversation available.
- Architect: decomposes confirmed requirements into GitHub issues, reviews PRs, and controls merge readiness.
- Developer: works on one issue at a time with explicit directory ownership.
- QA: validates PRs against acceptance criteria before merge.
- DevOps: discusses and prepares deployment/CD setup.

Taskix uses GitHub issues, PRs, labels, and local SQLite state as the workflow backbone. It calls the local `codex` CLI directly instead of using a hosted API.

## Status

This project is an early MVP. It is useful for experimenting with AI role orchestration, GitHub issue-driven workflows, and local Codex automation.

Implemented:

- Next.js web console and API server in one process.
- Project management with GitHub repo binding.
- Local SQLite storage.
- Codex CLI status checks and cached results.
- GitHub CLI (`gh`) status checks.
- GitHub account setup with local SSH key generation.
- Project creation that writes Taskix workflow rules into `AGENTS.md`.
- Project chat for PM, Architect, and DevOps long-lived sessions.
- PM handoff detection through structured JSON.
- Workflow tracking IDs such as `WF-YYYYMMDD-NNN`.
- Architect issue planning.
- Server-created GitHub issues with Taskix labels.
- Developer issue sessions that can open PRs.
- Architect PR review and `need-qa` labeling.
- QA session startup.
- Workflow detail pages with issues, jobs, sessions, and timeline.
- Blocked session handling with tool-vs-business blocker distinction.
- Retry jobs for Codex/tool failures.

Still evolving:

- Robust background worker and watchdog handling.
- Full QA pass/fail automation loop.
- Final architect merge automation.
- Deployment/CD execution.
- GitHub webhook-driven synchronization.

## Architecture

```text
src/app/          Next.js pages and API routes
src/components/   Web UI components
src/lib/          Codex, GitHub, Telegram, storage, orchestration logic
docs/             Test and workflow documentation
data/             Local runtime data, ignored by git
```

Key runtime dependencies:

- `codex` CLI for local AI agent execution.
- `gh` CLI for GitHub repo, issue, PR, and label operations.
- SQLite through Node.js `node:sqlite`.
- Telegram Bot API if Telegram integration is enabled.

## Requirements

- Node.js with `node:sqlite` support.
- npm.
- GitHub CLI:

```bash
gh auth login
```

- Codex CLI:

```bash
codex --version
codex login
```

Taskix expects `codex exec` to work locally before workflows can run.

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_ORG/taskix.git
cd taskix
```

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://127.0.0.1:8000
```

The default dev script binds to `127.0.0.1:8000`.

## Configuration

Most settings can be configured in the web console.

Useful environment variables:

```bash
APP_BASE_URL=http://127.0.0.1:8000
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=

CODEX_BIN=codex
CODEX_MODEL=gpt-5.4
CODEX_SANDBOX=workspace-write
CODEX_APPROVAL_POLICY=never

GITHUB_TOKEN=
GITHUB_REPO=owner/repo
GITHUB_API_URL=https://api.github.com
DATA_DIR=./data
```

Runtime settings are stored in local SQLite at:

```text
data/taskix.sqlite
```

Do not commit `data/`.

## Web Console Usage

### 1. Check tools

Open `Tools` or `Settings` and verify:

- Codex CLI is installed.
- Codex login works.
- The selected model is available.
- `gh` is installed and authenticated.

Taskix does not run Codex checks automatically on every page load. It stores the last result and lets the user manually check again.

### 2. Configure GitHub account

Open Settings and configure a GitHub account:

- Enter a GitHub username or organization.
- Generate an SSH key.
- Add the public key to GitHub.
- Verify `gh auth status`.

This allows Taskix to list repos, create issues, update labels, and write `AGENTS.md`.

### 3. Add a project

Open Projects and create a project.

Required fields:

- Project name.
- GitHub account or organization.
- GitHub repository.
- Agent instructions file path, usually `AGENTS.md`.
- Auto deploy preference.

When the project is created, Taskix writes a managed workflow section into the target repo's `AGENTS.md`. Existing content outside the managed block is preserved.

### 4. Chat with the PM

Open a project page.

Use the PM chat to describe a requirement. The PM should respond naturally until the requirement is confirmed. Once ready, the PM returns a structured handoff JSON containing:

```json
{
  "status": "ready_for_architect",
  "requirement": "clear implementation requirement",
  "constraints": [],
  "acceptanceCriteria": [],
  "openQuestions": []
}
```

Taskix detects this and shows `Start Workflow`.

### 5. Start workflow

Click `Start Workflow`.

Taskix creates a workflow record, assigns a tracking code, starts the architect workflow, writes GitHub issues, and starts developer work through jobs.

Workflow details are available at:

```text
/projects/:projectId/workflows/:workflowId
```

The workflow detail page shows:

- Requirement.
- Issues.
- GitHub issue links.
- PR links.
- Developer and QA sessions.
- Jobs.
- Timeline.

### 6. Handle blockers

Blocked sessions show the exact blocker reason.

If the blocker is a tool/runtime problem, such as Codex usage limits, auth failures, or GitHub API/network issues, Taskix shows `Retry Codex`.

If the blocker is a business/workflow problem, such as invalid owned paths or ambiguous acceptance criteria, Taskix shows `Send to Architect`.

The architect can resolve business blockers by updating issue scope and queueing developer retry jobs.

## Telegram Usage

Telegram support is optional.

Configure:

```bash
TELEGRAM_BOT_TOKEN=
TELEGRAM_WEBHOOK_SECRET=
APP_BASE_URL=
```

Register the webhook:

```bash
curl http://127.0.0.1:8000/api/setup/webhook
```

Commands:

```text
/start
/projects
/use <project_slug>
/current
/status <workflow_id>
```

After selecting a project, normal messages are sent to that project's PM session.

## GitHub Labels

Taskix creates and uses labels such as:

```text
taskix:planned
taskix:dev-running
taskix:pr-opened
taskix:architect-review
taskix:need-qa
taskix:qa-running
taskix:qa-passed
taskix:qa-failed
taskix:ready-to-merge
taskix:merged
taskix:deployed
taskix:blocked
role:backend_developer
role:web_developer
role:app_developer
role:admin_developer
role:devops_developer
role:data_developer
role:general_developer
```

Labels are part of the workflow state and should not be edited casually.

## Development

Run type checks:

```bash
npm run typecheck
```

Build:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Security Notes

Do not commit local runtime data.

Ignored by default:

```text
data/
node_modules/
.next/
.env
.env.local
firstApp/
firstApp-*/
*-issue*/
```

`data/` may contain:

- SQLite runtime state.
- Codex local state.
- GitHub SSH private keys.
- Cached tool status.
- Project and workflow history.

Treat it as sensitive.

## Roadmap

- Background worker process for jobs.
- Job watchdog and stale-running recovery.
- GitHub webhook synchronization.
- More reliable QA and merge automation.
- DevOps/CD workflow generation.
- Better session logs and live streaming output.
- Multi-user authorization for the web console.

## License

License is not declared yet.
