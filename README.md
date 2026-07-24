# Build With Duke

The production portfolio, lead-generation site, article publisher, and protected content workspace for Duke Chijimaka Jonathan. The public site runs at [buildwithduke.pages.dev](https://buildwithduke.pages.dev).

The application uses React 19, Vite, React Router, Cloudflare Pages Functions, D1, R2, KV, Turnstile, Tiptap, Google Apps Script, OpenRouter, and SerpApi. DAEMON is a deterministic on-site command and query interface; it does not call an AI model.

## What is included

- Public portfolio, project case studies, services, pricing, About, CV, contact, articles, and legal routes.
- D1-backed projects, testimonials, pricing, published articles, business settings, route copy, DAEMON commands, leads, and autoblog audits.
- A friendly `/admin` workspace with structured page fields; ordinary content never requires raw JSON editing.
- Sanitized Tiptap article authoring, public article routes, RSS, sitemap entries, canonical metadata, and structured data.
- A searchable OpenRouter model picker with provider, free/paid, tool-use, and image-capability filters.
- Turnstile-protected enquiries, D1 lead retention, free Gmail notifications through Apps Script, and Outlook `mailto:` reply handoff.
- Consent-gated Plausible analytics and independently remembered DAEMON visibility for public pages and `/admin`.

## Repository layout

```text
apps/web/src                 React app and protected admin workspace
apps/web/functions           Cloudflare Pages Functions
apps/web/public              Static public assets
apps/web/wrangler.toml       Sole Cloudflare/Wrangler configuration
packages/db/migrations       Ordered D1 migrations
tools/google-apps-script     Contact notification relay
```

The Cloudflare Pages project root is `apps/web`. Do not create repository-root `functions` or `wrangler.toml` copies. `apps/web/build/client` is generated and must not be committed.

## Requirements

- Node.js 22 or newer
- pnpm 10 (`corepack enable` if pnpm is unavailable)
- A Cloudflare account for production Pages, D1, R2, KV, and Turnstile
- Optional accounts for Plausible, Google Apps Script/Gmail, OpenRouter, and SerpApi

## Local setup

```bash
git clone https://github.com/gerald-george/buildwithduke.git
cd buildwithduke
corepack enable
pnpm install
pnpm dev
```

The Vite app runs at `http://localhost:5173`. Vite development serves the frontend; API requests gracefully use local fallback content when Pages Functions are not running.

For a closer Cloudflare Pages preview:

```bash
pnpm build
cd apps/web
pnpm exec wrangler pages dev build/client
```

Place local server-only values in `apps/web/.dev.vars`. Place Vite build variables in `apps/web/.env.local`. Both are ignored by Git.

```dotenv
# apps/web/.env.local — values prefixed VITE_ are public in the browser bundle
VITE_TURNSTILE_SITE_KEY=
VITE_PLAUSIBLE_DOMAIN=buildwithduke.pages.dev

# apps/web/.dev.vars — private Pages Function values
TURNSTILE_SECRET_KEY=
ADMIN_EMAIL=buildwithduke@outlook.com
ADMIN_PASSWORD_HASH=sha256:...
ADMIN_SESSION_SECRET=...
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
CONTACT_RELAY_SECRET=...
OPENROUTER_API_KEY=...
SERPAPI_API_KEY=...
AUTOBLOG_CRON_SECRET=...
```

## Configuration reference

| Name | Visibility | Required for | Where to obtain it |
| --- | --- | --- | --- |
| `VITE_TURNSTILE_SITE_KEY` | Public build variable | Contact form widget | Create a widget in [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/get-started/) and copy its site key. |
| `TURNSTILE_SECRET_KEY` | Encrypted server secret | Contact form verification | Copy the matching secret key from the same Turnstile widget. |
| `VITE_PLAUSIBLE_DOMAIN` | Public build variable | Optional consent-gated analytics | Add the production hostname to [Plausible](https://plausible.io/docs/add-website), or leave blank to disable analytics. |
| `ADMIN_EMAIL` | Server variable | Admin sign-in identity | Choose the private email address used to sign in. It defaults to the business Outlook address only when configured that way. |
| `ADMIN_PASSWORD_HASH` | Encrypted server secret | Admin password verification | Generate a SHA-256 digest locally using the instructions below. Never store the plaintext password. |
| `ADMIN_SESSION_SECRET` | Encrypted server secret | Signed eight-hour admin sessions | Generate at least 32 random bytes locally. |
| `GOOGLE_APPS_SCRIPT_URL` | Encrypted server secret | Gmail lead notifications | Deploy `tools/google-apps-script/contact-relay.gs` as a Google Apps Script web app and copy its `/exec` URL. |
| `CONTACT_RELAY_SECRET` | Encrypted server secret | Authenticate Cloudflare to Apps Script | Generate locally and set the identical value in Cloudflare and Apps Script properties. |
| `OPENROUTER_API_KEY` | Encrypted server secret | Scheduled article generation | Create a key at [OpenRouter Keys](https://openrouter.ai/keys). Apply a spending limit appropriate to the selected models. |
| `SERPAPI_API_KEY` | Encrypted server secret | Current source research for articles | Create an account and copy the key from the [SerpApi dashboard](https://serpapi.com/manage-api-key). |
| `AUTOBLOG_CRON_SECRET` | Encrypted server and GitHub secret | Authenticate scheduled article checks | Generate locally; use the same value in Cloudflare Pages and the GitHub Actions secret. |
| `DB` | D1 binding | All persisted content, leads, sessions, and audit data | Create a D1 database, then bind it as documented in [Cloudflare Pages bindings](https://developers.cloudflare.com/pages/functions/bindings/). |
| `MEDIA` | R2 binding | Admin media uploads | Create an R2 bucket and bind it as `MEDIA`. |
| `CACHE` | KV binding | Login rate limiting and short-lived server state | Create a KV namespace and bind it as `CACHE`. |

Only variables with the `VITE_` prefix are allowed in client code. Never expose admin credentials, API keys, relay secrets, bank details, session secrets, or deployment credentials through a `VITE_` variable or public business setting.

### Generate admin credentials

Create a password digest without putting the password in shell history:

```bash
read -s -p "Admin password: " DUKE_ADMIN_PASSWORD
printf '\nsha256:'
printf '%s' "$DUKE_ADMIN_PASSWORD" | sha256sum | cut -d' ' -f1
unset DUKE_ADMIN_PASSWORD
```

Save the complete `sha256:<digest>` output as `ADMIN_PASSWORD_HASH`. Generate the session and shared secrets separately:

```bash
openssl rand -base64 48
```

Use a different random value for `ADMIN_SESSION_SECRET`, `CONTACT_RELAY_SECRET`, and `AUTOBLOG_CRON_SECRET`.

## Cloudflare infrastructure

The committed `apps/web/wrangler.toml` contains the production binding names and current resource IDs. To provision replacements:

```bash
pnpm exec wrangler d1 create buildwithduke
pnpm exec wrangler r2 bucket create buildwithduke-media
pnpm exec wrangler kv namespace create CACHE
```

Copy the returned identifiers into `apps/web/wrangler.toml`. Keep the binding names exactly `DB`, `MEDIA`, and `CACHE`.

This project deliberately keeps the complete schema in one initial migration. Apply `0001_initial.sql` when provisioning a fresh D1 database; update that file when the schema changes instead of adding later numbered migrations.

```bash
pnpm exec wrangler d1 execute buildwithduke --local --config apps/web/wrangler.toml --file packages/db/migrations/0001_initial.sql
```

The migrations use safe `IF NOT EXISTS`/`INSERT OR IGNORE` operations for shared route records, but take a D1 backup before applying schema changes to a database with irreplaceable content.

## Cloudflare Pages setup

Create or connect the Pages project to `gerald-george/buildwithduke` with these settings:

- Production branch: `main`
- Root directory: `apps/web`
- Build command: `pnpm build`
- Build output directory: `build/client`
- Node version: `22`

In Pages → Settings → Bindings, attach the production and preview D1, R2, and KV resources. In Pages → Settings → Variables and Secrets, add the values from the configuration table. Mark every private value as encrypted. Build variables such as `VITE_TURNSTILE_SITE_KEY` must be available during the Pages build as well as production runtime.

CLI deployment from the repository root is available when Wrangler is authenticated:

```bash
pnpm deploy:pages
```

## Contact form and free Gmail notifications

The contact endpoint verifies Turnstile, validates every field, stores the accepted enquiry in D1, and then attempts a private Gmail notification. A relay failure never discards an already stored enquiry.

1. Sign in to the Gmail account that should receive alerts and create a standalone project at [script.google.com](https://script.google.com).
2. Replace the editor content with `tools/google-apps-script/contact-relay.gs`.
3. In Project Settings → Script properties, add:
   - `RELAY_SECRET`: the exact `CONTACT_RELAY_SECRET` value.
   - `NOTIFICATION_EMAIL`: the Gmail address receiving alerts.
   - `BUSINESS_REPLY_EMAIL`: the business mailbox used for replies.
4. Choose Deploy → New deployment → Web app.
5. Set Execute as to **Me**, Who has access to **Anyone**, authorize `MailApp`, and deploy.
6. Store the resulting `/exec` URL as `GOOGLE_APPS_SCRIPT_URL` in Cloudflare.
7. Submit a real enquiry, confirm the D1 lead and Gmail message, then test **Draft reply in Outlook** from admin.

The relay revalidates and length-limits the payload. Apps Script quotas apply; see the official [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas) and [web app deployment guide](https://developers.google.com/apps-script/guides/web).

## Scheduled article publishing

The hourly GitHub workflow calls the protected scheduler. D1 settings—not the workflow interval—decide whether an article is actually due. Each run:

1. Selects a configured topic lane.
2. Uses SerpApi for current results.
3. Uses the selected OpenRouter model to draft structured original HTML.
4. Sanitizes the HTML and appends attributed source links.
5. Compares the title and content shingles with the latest 100 posts.
6. Creates a review draft or publishes, subject to the monthly cap.

Setup:

1. Add `OPENROUTER_API_KEY`, `SERPAPI_API_KEY`, and `AUTOBLOG_CRON_SECRET` to Cloudflare Pages as encrypted secrets.
2. In GitHub → Settings → Secrets and variables → Actions, create an Actions secret named `AUTOBLOG_CRON_SECRET` with the same scheduler value. GitHub documents the flow under [encrypted Actions secrets](https://docs.github.com/actions/security-guides/using-secrets-in-github-actions).
3. Open Admin → Autoblog, choose a current model from the searchable/filterable catalogue, set topic lanes and limits, and keep **Create drafts for review** until the output has been reviewed in production.
4. Use **Run now** once to verify OpenRouter, SerpApi, D1, HTML sanitation, and the audit trail.

OpenRouter model IDs and availability change over time, so the admin selector reads the current [OpenRouter Models API](https://openrouter.ai/docs/guides/overview/models) rather than keeping a hard-coded list.

## Admin content model

`/admin` exposes:

- **Pages**: structured route introductions, Home sections, Services, About, CV, Contact, Blog, shared CTA/footer copy, and legal text, plus per-route SEO fields.
- **Projects**: case studies, R2-backed screenshots with storage deletion, categories, mockup labels, technologies, and drag-and-drop display order.
- **Testimonials**: verified quotes and drag-and-drop ordering. Public quotes receive scroll-triggered typing animation.
- **Pricing**: package names, GBP starting values, features, popularity, and drag-and-drop order.
- **Articles**: Tiptap HTML, search metadata, sources, draft/published status, and scheduling.
- **Leads**: enquiry status, CSV export, and Outlook reply handoff.
- **DAEMON**: deterministic custom responses and navigation/link/theme actions.
- **Settings**: a strict public allowlist of business contact and availability values.
- **Autoblog and Notifications**: contact-form readiness, automation controls, and deletable audit history.

Published articles are linked from the main navigation and can appear on the Home page. Article bodies are allowlist-sanitized before D1 storage and sanitized again in the browser.

DAEMON is enabled by default on public routes and disabled by default in admin so it cannot cover admin controls. The terminal button in the site header toggles it independently for public and admin contexts, with each preference stored locally in the browser.

## Verification

Run the complete production gate before committing or deploying:

```bash
pnpm typecheck
pnpm build
pnpm --filter @buildwithduke/web test:e2e
git diff --check
```

The Playwright suite covers desktop and mobile routes, navigation, responsive media, theme and consent, deterministic DAEMON controls, structured admin editing, OpenRouter model search/filter UI, lead handoff, and sanitized article rendering.

## Security and operational notes

- `githubpat.txt` is an ignored local deployment credential. It is not an application secret, must never be printed, and must never be committed.
- Admin cookies are HttpOnly, Secure, SameSite Strict, signed, and expire after eight hours. Mutations require the session CSRF token.
- Login attempts are rate-limited through `CACHE`.
- Consent audit rows older than 12 months and consented DAEMON event rows older than 90 days are pruned as new rows arrive; completed autoblog runs can also be cleared from admin.
- Public business settings and page content are explicitly constrained; sensitive operational values belong only in encrypted server secrets.
- Bank details are never stored in public settings or client code. They are shared privately with an accepted quote or invoice.
- `origin` must remain `https://github.com/gerald-george/buildwithduke.git`; production Git deployments target `origin/main`.
- Replace `apps/web/public/duke-chijimaka-jonathan-cv.pdf` when the downloadable CV changes, and update the managed `/cv` content at the same time.

## Troubleshooting

- **Admin says a table or column is missing:** apply every file in `packages/db/migrations` to the bound D1 database.
- **Public content falls back to repository defaults:** confirm the `DB` binding, migration state, and `/api/content` response. Public responses are edge-cached briefly.
- **Uploads fail:** verify the `MEDIA` R2 binding and accepted JPG, PNG, WebP, or AVIF file size.
- **Login fails despite correct credentials:** confirm `ADMIN_EMAIL`, the `sha256:` prefix on `ADMIN_PASSWORD_HASH`, the `CACHE` binding, and a 32-byte-or-longer `ADMIN_SESSION_SECRET`.
- **Contact submissions fail:** verify the Turnstile site/secret pair, allowed hostname, D1 binding, and Pages production variables.
- **Leads store but email does not arrive:** check `GOOGLE_APPS_SCRIPT_URL`, the matching relay secret, Apps Script execution logs, and Gmail quota.
- **Autoblog model list fails:** verify the OpenRouter secret and that Pages Functions can reach `https://openrouter.ai/api/v1/models`.
- **Scheduled runs never start:** ensure scheduled creation is enabled, the next-run time is due, and the GitHub/Cloudflare `AUTOBLOG_CRON_SECRET` values match.
