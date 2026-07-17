# buildwithduke

The portfolio and lead-generation site for Duke Chijimaka Jonathan. It is a Vite/React Router application with Cloudflare Pages Functions, D1 persistence, R2-ready media, a reactive terminal companion, and a deliberately restrained Terminal-Noir design system.

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

Create the infrastructure, replace the placeholder binding IDs in `apps/web/wrangler.toml`, then apply the schema:

```bash
pnpm dlx wrangler d1 create buildwithduke
pnpm dlx wrangler r2 bucket create buildwithduke-media
pnpm dlx wrangler d1 execute buildwithduke --remote --file packages/db/migrations/0001_initial.sql
```

Configure `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, and `ADMIN_API_TOKEN` as encrypted Pages secrets. Configure `VITE_TURNSTILE_SITE_KEY` as a build variable. The contact endpoint still validates and stores leads if Resend is absent, but production Turnstile requires both keys.

The phone and WhatsApp number in the specification is explicitly a placeholder. Replace `+44 7000 000000` and the `wa.me` target before public launch. Upload the final CV PDF to R2 and replace the disabled CV download control.

## Data and adapters

The initial D1 schema is in `packages/db/migrations`. External concerns are represented by small interfaces under `packages/` so UI code does not depend on a Cloudflare binding directly.

Migration path:

- D1 to Supabase Postgres: retain the repository interfaces and implement `packages/db-adapters/supabase`.
- R2 to Supabase Storage: implement `StorageAdapter` with the same object keys.
- Pages Functions to Netlify: move handlers behind Netlify request/response wrappers; validation and email/payment adapters remain unchanged.
- KV to another cache: implement `CacheAdapter` without changing callers.

## Content integrity

Live projects and demo builds are labelled separately. Project outcome figures are presented as Duke's reported results and no client testimonials are invented. Captured project previews are local build assets, so the portfolio does not depend on a third-party screenshot service at runtime.

## Security notes

`githubpat.txt`, `.dev.vars`, and `.env*` are ignored. Never commit deployment credentials. The local `/admin` screen is an interface preview only; production CRUD must be connected to authenticated Pages Functions using hashed credentials, CSRF tokens, secure session cookies, and rate limiting before it is exposed.
