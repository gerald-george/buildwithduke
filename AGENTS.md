# Repository guidance

## Canonical repository

- GitHub repository: `https://github.com/gerald-george/buildwithduke`
- Primary branch: `main`
- Keep the local `origin` remote pointed at that repository.
- Never commit or print `githubpat.txt`; it is an ignored local deployment credential.
- Only force-push when the user explicitly requests it. Before doing so, run the verification commands below and confirm the destination with `git remote -v`.

## Project layout

- `apps/web/src`: React/Vite application, including the protected admin workspace.
- `apps/web/functions`: Cloudflare Pages Functions used by app-directory workflows.
- `functions`: matching Cloudflare Pages Functions used when the repository root is the Pages project root.
- `packages/db/migrations`: ordered D1 schema migrations.
- `apps/web/build/client`: generated production output; do not commit it.

Until the Cloudflare project is consolidated around one root convention, keep matching handlers under `apps/web/functions` and `functions` in sync. The checked-in root `wrangler.toml` is for repository-root builds; `apps/web/wrangler.toml` supports commands run from the web app.

## Working conventions

- Use pnpm 10 and Node 22 or newer.
- Preserve existing and uncommitted user work unless explicitly asked to remove it.
- Keep admin controls task-specific and user-friendly. Do not expose JSON editing for ordinary content or configuration.
- Store article bodies as sanitized HTML produced through the Tiptap editor.
- Restrict public business settings to the allowlist shared by the admin API and public content API.
- Never put bank details, admin secrets, session secrets, API keys, or deployment credentials in public settings or client code.

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
- Build output directory: `apps/web/build/client`
- CLI deploy command: `pnpm deploy:pages`
- GitHub deployments target `origin/main` at the canonical repository above.
