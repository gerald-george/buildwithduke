# Repository guidance

## Canonical repository

- GitHub repository: `https://github.com/gerald-george/buildwithduke`
- Primary branch: `main`
- Keep the local `origin` remote pointed at that repository.
- Never commit or print `githubpat.txt`; it is an ignored local deployment credential.
- Only force-push when the user explicitly requests it. Before doing so, run the verification commands below and confirm the destination with `git remote -v`.

## Project layout

- `apps/web/src`: React/Vite application, including the protected admin workspace.
- `apps/web/functions`: Cloudflare Pages Functions for the app-local Pages project.
- `apps/web/wrangler.toml`: the sole Wrangler configuration, including production resource bindings.
- `packages/db/migrations`: ordered D1 schema migrations.
- `apps/web/build/client`: generated production output; do not commit it.

The Cloudflare Pages project root is `apps/web`. Keep Pages Functions and Cloudflare configuration there; do not recreate repository-root `functions` or `wrangler.toml` copies.

## Working conventions

- Use pnpm 10 and Node 22 or newer.
- Preserve existing and uncommitted user work unless explicitly asked to remove it.
- Keep admin controls task-specific and user-friendly. Do not expose JSON editing for ordinary content or configuration.
- Store article bodies as sanitized HTML produced through the Tiptap editor.
- Restrict public business settings to the allowlist shared by the admin API and public content API.
- Never put bank details, admin secrets, session secrets, API keys, or deployment credentials in public settings or client code.
- Keep the complete D1 schema in `packages/db/migrations/0001_initial.sql`. This project deliberately uses a single initial migration: update that file when the schema changes and do not add later numbered migration files.
- Keep implementation language (database state, admin publishing state, deployment details, internal services and placeholder commentary) out of visitor-facing copy, including DAEMON responses. Preserve the site's DAEMON identity and terminal-style presentation. DAEMON visibility controls belong in the admin workspace, never in the public header or page controls.
- Where a public content type supports imagery, expose a clear R2-backed upload control in its admin editor; do not require an administrator to paste bucket keys or edit JSON.

## Verification

Run before committing a production change:

```bash
pnpm typecheck
pnpm build
pnpm --filter @buildwithduke/web test:e2e
git diff --check
```

## Deployment

- Cloudflare Pages build command: `pnpm build`
- Cloudflare Pages root directory: `apps/web`
- Build output directory: `build/client` (relative to the Pages root)
- CLI deploy command: `pnpm deploy:pages`
- GitHub deployments target `origin/main` at the canonical repository above.
