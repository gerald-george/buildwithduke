# buildwithduke

The production portfolio and lead-generation site for Duke Chijimaka Jonathan, published at [buildwithduke.pages.dev](https://buildwithduke.pages.dev). It is a Vite/React Router application with Cloudflare Pages Functions, D1 persistence, R2-ready media, consent-gated analytics, a reactive terminal companion, and a deliberately restrained Terminal-Noir design system.

## Local development

Requirements: Node 22+ and pnpm 10+.

```bash
pnpm install
pnpm dev
```

The web app runs at `http://localhost:5173`. A production bundle is created with:

```bash
pnpm build
```

Output: `apps/web/build/client`.

## Cloudflare Pages

Use the repository root as the build root.

- Build command: `pnpm build`
- Build output: `apps/web/build/client`
- Functions directory: `apps/web/functions`
- Node version: `22`

The root `wrangler.toml` also declares the monorepo build command and output path, so Wrangler-driven builds do not depend on duplicated dashboard build fields. For an explicit CLI deployment, run `pnpm deploy:pages`; it builds first, then deploys from the app directory so Pages Functions are discovered alongside the app-level binding configuration.

Create the infrastructure, replace the placeholder binding IDs in `apps/web/wrangler.toml`, then apply both schema migrations in order:

```bash
pnpm dlx wrangler d1 create buildwithduke
pnpm dlx wrangler r2 bucket create buildwithduke-media
pnpm dlx wrangler d1 execute buildwithduke --remote --file packages/db/migrations/0001_initial.sql
pnpm dlx wrangler d1 execute buildwithduke --remote --file packages/db/migrations/0002_production_admin.sql
```

Configure `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, and `CONTACT_FROM_EMAIL` as encrypted Pages secrets. Configure `ADMIN_EMAIL`, `VITE_TURNSTILE_SITE_KEY`, and `VITE_PLAUSIBLE_DOMAIN` as build/runtime variables. `CONTACT_FROM_EMAIL` must be a sender verified by Resend. Production contact requests fail closed when Turnstile or D1 is unavailable; successfully validated enquiries are stored even if an email provider has a transient failure. Bank transfer is the only payment method currently offered; payment details are sent privately with an accepted quote or invoice and are never stored in client-side code.

The public WhatsApp number and GitHub organisation match Duke’s current public profiles. The included headshot, logo, project captures and concise CV PDF are served locally, so the public portfolio has no media-service dependency. Replace the concise PDF with Duke’s final long-form CV whenever it is available.

The admin password is never stored as plaintext. Store a `sha256:`-prefixed SHA-256 digest in `ADMIN_PASSWORD_HASH`; the session signing secret should be at least 32 random bytes. The admin UI provides protected CRUD for projects, testimonials, pricing, leads, build-log posts, DAEMON commands, and business settings. Login attempts are rate-limited through the `CACHE` KV binding, mutations require a per-session CSRF token, and cookies are HttpOnly, Secure, SameSite Strict, and expire after eight hours.

## Data and adapters

The initial D1 schema is in `packages/db/migrations`. External concerns are represented by small interfaces under `packages/` so UI code does not depend on a Cloudflare binding directly.

Migration path:

- D1 to Supabase Postgres: retain the repository interfaces and implement `packages/db-adapters/supabase`.
- R2 to Supabase Storage: implement `StorageAdapter` with the same object keys.
- Pages Functions to Netlify: move handlers behind Netlify request/response wrappers; validation, email and bank-transfer-instructions adapters remain unchanged.
- KV to another cache: implement `CacheAdapter` without changing callers.

## Content integrity

Live projects and demo builds are labelled separately. Project outcome figures are presented as Duke's reported results and no client testimonials are invented. Captured project previews are local build assets, so the portfolio does not depend on a third-party screenshot service at runtime.

## Security notes

`githubpat.txt`, `.dev.vars`, and `.env*` are ignored. Never commit deployment credentials. The `/admin` interface only unlocks when the production session secret and hashed credentials are configured; there is no preview bypass or public registration path.
