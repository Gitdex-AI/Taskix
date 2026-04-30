# Repository Guidelines

## Project Structure & Module Organization

Taskix is a Next.js 16 TypeScript app. Application routes and API handlers live in `src/app`; reusable UI lives in `src/components`; server-side workflow, GitHub, Codex, Telegram, settings, and storage logic lives in `src/lib`. Global styles are in `src/app/globals.css`. Local runtime state is expected under `data/` and should not be committed. Project configuration is in `package.json`, `tsconfig.json`, and `next.config.mjs`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local Next.js server at `http://127.0.0.1:8000`.
- `npm run build`: create a production build and catch Next.js build errors.
- `npm run start`: serve the production build on `127.0.0.1:8000`.
- `npm run typecheck`: run `tsc --noEmit` for TypeScript validation.

Before running workflows, confirm the external CLIs work locally: `codex --version`, `codex login`, and `gh auth status`.

## Coding Style & Naming Conventions

Use TypeScript and React server components by default in `src/app`; mark components with `"use client"` only when they need client-side state or browser APIs. Follow the existing style: two-space indentation, double quotes, semicolons, named exports for shared helpers, and path aliases such as `@/lib/store`. Components use PascalCase file names such as `ProjectChatArea.tsx`; library modules use lowercase kebab names such as `pm-handoff.ts`.

## Testing Guidelines

There is no dedicated test runner configured yet. For now, use `npm run typecheck` and `npm run build` as the baseline verification for code changes. If adding tests, keep them close to the behavior under test and prefer clear names such as `pm-handoff.test.ts` or `ProjectChatArea.test.tsx`. Document any new test command in `package.json` and this file.

## Commit & Pull Request Guidelines

The GitHub repository is `git@github.com:Taskix-AI/Taskix.git`; it is currently empty, so no repository-specific commit convention could be inferred. Use concise, imperative commit subjects, for example `Add workflow retry controls`. Pull requests should include a short problem summary, the implemented change, verification commands run, linked issues when applicable, and screenshots for UI changes.

## Security & Configuration Tips

Keep secrets in `.env` or local settings, never in source files. Common local variables include `APP_BASE_URL`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, `CODEX_BIN`, `GITHUB_TOKEN`, `GITHUB_REPO`, and `DATA_DIR`. Do not commit generated SQLite files, SSH keys, Codex session data, or other contents from `data/`.
