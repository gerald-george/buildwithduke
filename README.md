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
- Functions directory: `functions` when the Pages project root is the repository root
- Node version: `22`

Cloudflare Pages does not support a `[build]` section in `wrangler.toml`, so keep the build command and root directory in the Pages dashboard. The root `wrangler.toml` declares the output path and production bindings. For an explicit CLI deployment, run `pnpm deploy:pages`; it builds first and deploys `apps/web/build/client`. Matching handlers remain under both `functions` and `apps/web/functions` so repository-root and app-directory Pages workflows behave consistently.

Create the infrastructure, replace the placeholder binding IDs in `apps/web/wrangler.toml`, then apply both schema migrations in order:

```bash
pnpm dlx wrangler d1 create buildwithduke
pnpm dlx wrangler r2 bucket create buildwithduke-media
pnpm dlx wrangler d1 execute buildwithduke --remote --file packages/db/migrations/0001_initial.sql
pnpm dlx wrangler d1 execute buildwithduke --remote --file packages/db/migrations/0002_production_admin.sql
```

Configure `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_SECRET`, and `CONTACT_FROM_EMAIL` as encrypted Pages secrets. Configure `ADMIN_EMAIL`, `VITE_TURNSTILE_SITE_KEY`, and `VITE_PLAUSIBLE_DOMAIN` as build/runtime variables. `CONTACT_FROM_EMAIL` must be a sender verified by Resend. Production contact requests fail closed when Turnstile or D1 is unavailable; successfully validated enquiries are stored even if an email provider has a transient failure. Bank transfer is the only payment method currently offered; payment details are sent privately with an accepted quote or invoice and are never stored in client-side code.

The public WhatsApp number and GitHub organisation match Duke’s current public profiles. The included headshot, logo, project captures and concise CV PDF are served locally, so the public portfolio has no media-service dependency. Replace the concise PDF with Duke’s final long-form CV whenever it is available.

The admin password is never stored as plaintext. Store a `sha256:`-prefixed SHA-256 digest in `ADMIN_PASSWORD_HASH`; the session signing secret should be at least 32 random bytes. The professional admin workspace provides an activity overview, searchable and filtered records, purpose-built fields, media upload and preview, project metrics and tag builders, lead status management and CSV export, pricing and testimonial workflows, DAEMON controls, and an approved public-settings editor. Articles use the free MIT-licensed Tiptap WYSIWYG editor, publish to dedicated article routes, and are sanitized with DOMPurify before public rendering. Login attempts are rate-limited through the `CACHE` KV binding, mutations require a per-session CSRF token, and cookies are HttpOnly, Secure, SameSite Strict, and expire after eight hours.

Public business settings are deliberately allowlisted: business name, contact email, phone details, WhatsApp number, service area, response time, social profile URLs, and project availability. They must never contain private payment instructions or secrets.

## Data and adapters

The initial D1 schema is in `packages/db/migrations`. External concerns are represented by small interfaces under `packages/` so UI code does not depend on a Cloudflare binding directly.

Migration path:

- D1 to Supabase Postgres: retain the repository interfaces and implement `packages/db-adapters/supabase`.
- R2 to Supabase Storage: implement `StorageAdapter` with the same object keys.
- Pages Functions to Netlify: move handlers behind Netlify request/response wrappers; validation, email and bank-transfer-instructions adapters remain unchanged.
- KV to another cache: implement `CacheAdapter` without changing callers.

## Content integrity

Live projects and mockup builds are labelled separately. Project outcome figures are presented as Duke's reported results and no client testimonials are invented. Captured project previews are local build assets, so the portfolio does not depend on a third-party screenshot service at runtime.

## Security notes

`githubpat.txt`, `.dev.vars`, and `.env*` are ignored. Never commit deployment credentials. The `/admin` interface only unlocks when the production session secret and hashed credentials are configured; there is no preview bypass or public registration path.
