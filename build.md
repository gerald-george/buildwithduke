Portfolio Site

# buildwithduke — Website Strategy & Full-Stack Build Prompt

**This build is scoped to Tier 4 — Premium (£1,999-equivalent effort, self-commissioned).**
Upgrading to Tier 5 (Custom) would add: a fully bespoke booking/CRM system replacing the lightweight lead-flow (calendar sync, contract e-signing, client portal with project status tracking) — worth considering once buildwithduke has a steady client pipeline, but not needed for launch.

**Chosen UI/UX direction: Minimalist Dark, hybridised with Cyberpunk/Glitch terminal accents (“Terminal-Noir”).**
Rationale: Duke’s own logo is already a monospace, terminal-bracket wordmark (`<BUILD WITH DUKE/>`) on black, in a three-colour cube (green/white/blue). A generic “developer portfolio dark mode” would waste that asset. Pure Cyberpunk/Glitch alone would feel gimmicky and hurt trust with UK SME clients reading this as a hiring/pitch tool; pure Minimalist Dark alone would waste the “alive, terminal, aware of you” brief. The hybrid gives restrained, confident dark UI as the skeleton, with terminal/CLI behaviour as the nervous system — quietly nerdy, not loud.

**Signature visual device: “DAEMON” — a living terminal companion.**
A persistent, dismissible mini terminal window (styled like a real OS terminal, complete with traffic-light dots recoloured to brand green/white/blue) docked bottom-right. On load it runs a short boot sequence (`whoami`, `loading personality.sh`, `starting daemon...`). As the visitor scrolls, hovers, and clicks around the site, DAEMON prints live system-log-style lines reacting to what they’re doing (“visitor viewing: Projects/EventStreamHD”, “idle 12s — still there?”, “cursor moved 1,204px”, “resume.pdf requested”). Visitors can also click into it and type real commands (`help`, `whoami`, `projects`, `contact`, `sudo hire-duke`, `coffee`) that return real content or trigger real site actions (scroll to section, open contact form pre-filled). DAEMON is the thread that runs through Sections 4, 5, 12 and 30 — it is what makes the site feel aware of the visitor, not just decorated.

-----

## 1. Business Understanding

- **Business/brand name:** buildwithduke
- **Owner/operator:** Duke Chijimaka Jonathan — full-stack developer and AI automation specialist
- **Industry:** Freelance web development, full-stack application development, and AI/agentic automation consultancy
- **Location/service area:** UK-focused, fully remote (works from anywhere; no fixed UK office) — Assumption: display “Remote · UK-wide” rather than a city
- **Main services:** Full-stack web/app development (React, Next.js, Cloudflare), AI-assisted and agentic development workflows, n8n automation pipelines, admin/CRUD systems, AI-enhanced digital marketing/CRM builds
- **Target customers:** UK SMEs and solo founders needing a bespoke website or web app; UK agencies/technical cofounders needing an AI-automation or agentic-dev collaborator; small businesses wanting an n8n workflow built (lead pipelines, social auto-posting, CRM cleanup)
- **Main conversion goal:** Qualified enquiry — contact form submission or WhatsApp message requesting a quote/discovery call
- **Secondary goals:** GitHub/project click-throughs, CV/resume download, LinkedIn connection, newsletter/insights signup (optional)
- **Brand positioning:** “Cool-nerd who ships.” Technically serious (First-Class LIS degree, published thesis, production plugin, live Cloudflare deployments) but human, funny, unpretentious — a person, not an agency-shaped template.
- **Competitive angle:** Most freelance dev portfolios are static “here’s my stack” grids. buildwithduke’s site *behaves* like the product he builds for clients — interactive, alive, agentic — making the site itself the best case study.
- **Current online presence:** Linktree (`linktr.ee/buildwithduke`) aggregating GitHub, WhatsApp, and live project links; scattered live projects on Cloudflare Pages/Workers subdomains and one custom domain (`eventstreamhd.cam`)

**Assumptions made:**

- Contact email: `buildwithduke@outlook.com` (as instructed)
- Public phone/WhatsApp number: `+234 915 215 1634` (verified against Duke’s public Linktree profile)
- No registered UK company yet — site treated as a sole-trader freelance brand, not a Ltd company (no Companies House number shown); revisit if he incorporates
- WhatsApp Business number reused from the existing Linktree WhatsApp link
- “The Grills Corner” and “Home Away Travels” projects are Nigeria-based clients — kept in the portfolio as proof of range, clearly labelled by country, not misrepresented as UK work
- Demo-style portfolio entries (The Grills Corner and Home Away Travels) are labelled **“Demo build — live client agreement in place”** per Duke’s note, never presented as if they’re the client’s actual production storefront
- Bemdproperties and the Unconventional Soccer prompt/merch projects are deliberately excluded from the public portfolio
- Pricing tiers on the site are buildwithduke’s own client-facing service packages (adapted from the same five-tier structure used internally), not this build’s own cost

-----

## 1.5 Tier Recommendation (for this build)

|Tier             |Price equiv.|Best for                                            |Includes                                                                                                                                                                                   |
|-----------------|------------|----------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|1 — Foundation   |£499        |Simple brochure site                                |5 static pages, 1 contact form, core SEO                                                                                                                                                   |
|2 — Growth       |£999        |Small business needing content flexibility          |D1-backed services/testimonials/blog, reviews widget                                                                                                                                       |
|3 — Professional |£1,499      |Business needing self-serve content + leads         |Admin dashboard, booking/quote flow, R2 uploads, Turnstile                                                                                                                                 |
|**4 — Premium ✅**|**£1,999**  |**A living, interactive personal brand/agency site**|**Everything in 3, plus deep interactivity engine (DAEMON), R2-backed project media, bank-transfer quote/deposit guidance, unlimited landing pages, full custom animation system**|
|5 — Custom       |POA         |Multi-service platforms, client portals             |Scoped separately                                                                                                                                                                          |

**Recommendation: Tier 4 — Premium**, with one substitution: the standard “customer accounts/order tracking” Tier 4 feature is **not** needed (buildwithduke isn’t selling physical/digital products), so that budget is redirected into the DAEMON interaction engine, custom motion system, and a lightweight admin dashboard for Duke to manage his own projects/testimonials/pricing without redeploying code. **Bank transfer is the only payment method currently available**; details are shared privately after a quote is accepted.

-----

## 2. Website Strategy

- **Site type:** Personal brand / freelance agency portfolio with lead-gen + light admin CMS
- **Primary objective:** Convert visitors (recruiters, founders, SME owners) into a discovery-call or WhatsApp enquiry
- **Main CTA:** “Start a project” / “Let’s build something” → opens contact form pre-filled by DAEMON if triggered via terminal command
- **Secondary CTAs:** “View live projects”, “Download CV”, “Message on WhatsApp”, “See pricing”
- **Trust-building strategy:** Real, verifiable links (GitHub, live Cloudflare Pages URLs), quantified outcomes (65% workload reduction, 73% lead growth, 1M+ TikTok views in 7 days, 99% data integrity, First-Class Honours + Best Graduating Student + SUSI State Dept exchange alumnus), a visible “how I work” process section, and transparent demo-vs-production labelling on client projects
- **Sales funnel:** Hero hook → proof (live projects with visit buttons) → credibility (results/education/awards) → how-I-work → pricing → FAQ (objection handling) → final CTA → footer
- **Tone of voice:** First person throughout (“I build…”, “Here’s what I shipped…”), dry, warm, quietly funny — never corporate “we”. Matches the LinkedIn About voice supplied.
- **Visual style:** Terminal-Noir — black/near-black canvas, monospace-accented headings, green/white/blue brand triad, DAEMON terminal companion, glitch-on-hover micro-interactions used sparingly as punctuation, not wallpaper.
- **Technical complexity:** Medium-high — interaction-heavy frontend, D1-backed content (projects/testimonials/pricing), admin dashboard, R2 for project screenshots, bank-transfer quote/deposit flow, no customer accounts.
- **Needed (per tier):** ✅ Admin dashboard · ✅ DB-backed content · ✅ R2 uploads · ✅ Turnstile · ✅ bank-transfer guidance · ❌ card checkout · ❌ bookings/ordering · ❌ customer accounts

**UK considerations:** WhatsApp click-to-chat, click-to-call (stub number), GBP pricing throughout, Trustpilot/testimonials section, UK GDPR-compliant cookie consent + Privacy/Terms/Cookie pages, BST/GMT-aware “usually replies within” indicator, no VAT display needed while unregistered.

-----

## 3. Sitemap & Navigation

|Page                                   |Purpose                                                                          |Status                                       |
|---------------------------------------|---------------------------------------------------------------------------------|---------------------------------------------|
|`/` Home                               |Hook, proof, CTA                                                                 |Dynamic (D1-driven project/testimonial cards)|
|`/projects`                            |Full project index with filters (Web Dev / AI Automation / Software)             |Dynamic                                      |
|`/projects/[slug]`                     |Individual case study: problem, build, stack, result, screenshots, live/demo link|Dynamic, R2 images                           |
|`/about`                               |Duke’s story, education, awards, personality, “how I work”                       |Static content, DB-editable                  |
|`/pricing`                             |5-tier service packages, Professional highlighted as “Most Popular”              |Static content, DB-editable                  |
|`/services`                            |Web Dev / AI Automation / n8n Workflows / Digital Marketing breakdown            |Static, DB-editable                          |
|`/blog` (optional, Tier 4 nice-to-have)|Insights/build-logs, SEO + AI-SEO value                                          |D1-backed                                    |
|`/contact`                             |Main enquiry form + WhatsApp + email + DAEMON hand-off                           |Dynamic, D1 leads table                      |
|`/cv`                                  |CV summary + download link (PDF via R2)                                          |Static + R2 asset                            |
|`/privacy`, `/cookies`, `/terms`       |UK GDPR compliance                                                               |Static                                       |
|`/admin/*`                             |Duke’s dashboard (login-gated)                                                   |Dynamic, protected                           |

Each project/service/pricing page carries its own meta title/description, schema (Service, Person, CreativeWork), internal links back to `/contact` and related projects.

-----

## 4. Detailed Design Prompt

**Goal:** A portfolio site that reads as a live system, not a brochure — visitors should feel like they’ve SSH’d into Duke’s world.
**Audience:** UK founders/SME owners evaluating a freelance developer; recruiters/hiring managers; technical cofounders.
**Brand personality:** Calm-under-pressure cool-nerd. Confident, dry humour, precise, never try-hard.

**Layout direction:** Predominantly dark canvas (`#0A0A0C`), full-bleed sections with occasional asymmetric split-screen layout (code-pane-left / content-right) on the “How I Work” and project case-study sections — a deliberate break from the centred-hero default.

**Colour palette (from brand logo, extracted and refined):**

- Primary — **Terminal Black** `#0A0A0C` (canvas)
- Secondary — **Daemon Green** `#4ADE80` (success states, CLI accents, primary CTA in dark mode)
- Accent — **Duke Blue** `#5B7FDB` (links, secondary CTA, hover glow)
- Supporting — **Signal White** `#F5F5F0` (headings, primary text on dark)
- Light-mode inversion — **Paper White** `#F7F6F2` canvas with `#111318` text, same green/blue accents dimmed for AA contrast (a “printed manpage” light mode, not a generic white SaaS flip)

**Typography:**

- Display: **JetBrains Mono** or **Space Mono** (headings, DAEMON terminal, code-styled labels) — reinforces the brand wordmark
- Body: **Inter** or **General Sans** (readable prose, case studies, forms) — workhorse contrast to the monospace display

**Imagery:** Real screenshots of Duke’s live projects (EventStreamHD, Fraser James, Folder-to-text merger, etc.) inside a custom “browser/terminal frame” component — never generic stock photography. Duke’s own headshot is used sparingly, framed inside a scanline/CRT-edge treatment consistent with the theme.

**Icon style:** Lucide icons recoloured and restyled with a 1.5px monostroke, wrapped in small terminal-bracket badges (`[ ]`) rather than used bare at default size/colour.

**Animation style:** Scroll-triggered reveal with a subtle “typing”/decrypt text effect on headlines (characters resolve from random glyphs to final text, terminal-boot style — used once per page max, not on every heading, to avoid fatigue), magnetic-hover buttons, DAEMON’s live log ticking in real time, custom blinking-block text cursor replacing the default mouse cursor on desktop. All motion respects `prefers-reduced-motion` and drops to instant/fade fallback.

**Homepage sections:** see Section 5.

**Header/nav behaviour:** Fixed top bar styled as a terminal title bar (`buildwithduke — zsh`), traffic-light dots recoloured brand triad, nav links styled as file-tab pills. Condenses to a slide-out CLI-style menu on mobile with a `$ menu --open` affordance.

**Footer credit:** No external agency credit line applies here because Duke is buildwithduke. Use the compact self-referential line `// built with ❤️` and the copyright brand `Build With Duke`.

**CTA placement:** Sticky bottom-right DAEMON bubble doubles as a mobile sticky CTA; primary “Start a project” button repeats after hero, after proof section, and in final CTA.
**Lead-capture flow:** Contact form (name, email, company, project type dropdown, budget range, message) → Pages Function → validated → stored in D1 `leads` table → private notification to the configured Gmail account via Google Apps Script MailApp → follow-up from `buildwithduke@outlook.com` through the Outlook app → optional WhatsApp deep-link with pre-filled message.
**WhatsApp integration:** Floating action button + DAEMON `contact` command both open `wa.me/<number>?text=Hi%20Duke%2C%20I%20found%20your%20site%20and%20want%20to%20talk%20about%20a%20project`.
**Trust badges:** First-Class Honours, Best Graduating Student, SUSI State Dept Exchange Alumnus, “Live production builds on Cloudflare”, GitHub contribution proof.
**Accessibility:** WCAG 2.1 AA — all glitch/decrypt text effects have a static-text fallback for reduced-motion and screen readers (effect is decorative, real text is always in the DOM).
**Admin/CMS needs:** Manage projects, testimonials, pricing tiers, blog posts, leads export, DAEMON script/response library (so Duke can add new terminal commands without redeploying).

-----

## 5. Homepage Structure (text wireframe)

**1. Hero — full viewport**

- Headline (decrypt-in effect): *“I build things that work — and occasionally talk back.”*
- Subhead: *“Full-stack developer & AI automation specialist. I turn messy workflows and static ideas into fast, living web apps.”*
- Primary CTA: `Start a project →` · Secondary: `View my work`
- Visual: DAEMON boots live in the corner, printing its startup sequence as the hero loads — first appearance of the signature element, sets the tone immediately.

**2. Live proof strip**

- Horizontal auto-scrolling ticker of real stack logos/technologies (React, Next.js, Cloudflare, n8n, Claude, OpenAI Codex) — subtle, not the loud “trusted by” logo wall cliché.

**3. Featured projects (asymmetric grid — deliberate broken-grid section)**

- 3–4 featured builds in a staggered, unequal-height grid (not a uniform 3-column card row). Each card: browser/terminal-framed screenshot, one-line description, stack tags, `Visit` + `Case study` buttons.
- Goal: prove range fast. Headline: *“Some things I’ve shipped.”*

**4. Why work with me**

- Split-screen: left = short code-styled quote block (”`$ whoami` → *cool-nerd who ships*”), right = 4 short proof bullets pulling real metrics (65% workload cut, 73% lead growth, 1M+ views/7 days, 99% data integrity) framed as *what that means for you*, not just a resume brag.

**5. How I work (process)**

- 4-step horizontal timeline styled as terminal steps (`01 discover`, `02 design`, `03 build`, `04 ship`), signature element reappears as a mini DAEMON log line under each step showing what it “logs” during that phase.

**6. Pricing preview**

- Condensed 3-card view of Foundation / Professional (highlighted, “Most Popular”) / Premium, `See full pricing →` to `/pricing`.

**7. Social proof**

- Testimonial carousel — styled as terminal chat-log bubbles rather than generic quote cards.

**8. FAQ preview**

- 4–5 objection-handling Q&As (turnaround time, remote UK work, ownership/IP, revisions) in an accordion styled as expandable terminal `man` entries.

**9. Final CTA**

- Full-bleed: *“Got something messy that needs to make sense? Let’s fix that.”* → `Start a project` + WhatsApp button.

**10. Footer**

- Nav recap, contact details, socials (GitHub, LinkedIn, WhatsApp), legal links, DAEMON Easter-egg credit line, small `sudo say-hi` command hint.

-----

## 6. Page-by-Page Content Guide (condensed)

- **/projects/[slug]:** H1 = project name; sections = the problem, what I built, the stack, the result (metrics where available), screenshots, live/demo link with clear demo-labelling, “related projects.” Schema: `CreativeWork` + `Person` (author).
- **/pricing:** H1 = “Straightforward pricing, no surprises.” 5 tiers, Professional marked “Most Popular”, each with feature list, GBP price, “Get a custom quote” CTA for Tier 5.
- **/about:** H1 = “Hi, I’m Duke.” Story pulled from LinkedIn About (verbatim tone, rewritten in site voice), education/awards timeline, personality section (origami, astronomy, theology, “agentic vibe coding”), photo.
- **/contact:** H1 = “Let’s talk.” Form + WhatsApp + email + expected response time + DAEMON `contact` shortcut explainer.
- **/cv:** H1 = “The formal version.” Summary + download button (PDF in R2), links to GitHub/LinkedIn.

-----

## 7. Conversion Optimisation

Above-fold dual CTA, sticky DAEMON/WhatsApp bubble on mobile, short 5-field contact form, real project links (not screenshots-only), quantified results as trust signals, clear “usually replies within 24 hours (UK time)” line, l — DAEMON’s live/active feel does the “alive” job honestly instead.

-----

## 8. SEO Requirements

**Primary keywords:** “freelance full-stack developer UK”, “AI automation developer UK”, “n8n automation specialist UK”, “Cloudflare Pages developer”, “React Next.js freelancer UK remote”
**Secondary:** “agentic AI development”, “AI-assisted web development UK”, “small business website developer UK remote”
**Meta title example:** `buildwithduke — Full-Stack Developer & AI Automation Specialist (UK, Remote)`
**Schema:** `Person`, `ProfessionalService`, `CreativeWork` per project, `FAQPage`, `BreadcrumbList`, `Review` (once real testimonials exist)
**Blog topics (AI-SEO + SEO value):** “What agentic AI-assisted development actually means”, “n8n vs Zapier for UK small businesses”, “Why your business needs a real website, not just a Linktree”, “Cloudflare Pages vs Vercel for small business sites”

-----

## 9. AI SEO / Generative Search Optimisation

**Business Facts block (footer or `/about`, machine-readable + human-readable):**

- Name: buildwithduke (Duke Chijimaka Jonathan)
- Industry: Full-stack web/app development & AI automation consultancy
- Service area: UK-wide, remote
- Services: Website & web app development, AI automation (n8n), agentic AI-assisted development, admin/CRUD systems
- Email: [buildwithduke@outlook.com](mailto:buildwithduke@outlook.com)
- Phone/WhatsApp: +234 915 215 1634
- WhatsApp: available via site button
- Hours: Mon–Fri, 9am–6pm GMT/BST (flexible, remote)
- Payment methods accepted: Bank transfer only
- Credentials: First-Class Honours B.LIS (University of Port Harcourt), U.S. State Dept SUSI 2025 Exchange Alumnus, Overall Best Graduating Student 2025

Direct-answer FAQ content, natural-language service descriptions, no vague “synergy”-style marketing copy — concrete stack names and concrete outcomes throughout.

-----

## 10. Internal Linking Plan

Home → featured project case studies → `/contact`; `/projects` → individual case studies → related projects; `/pricing` → `/contact`; `/about` → `/cv` → `/contact`; blog posts → relevant service/project pages; footer links to all legal + social.

-----

## 11. Responsiveness

Mobile-first; DAEMON collapses to a small tappable icon (full terminal view opens as a bottom sheet, not a fixed corner box, on mobile); asymmetric grids stack to single column but keep the visual rhythm via alternating background tint; decrypt-text animation shortens/simplifies on mobile for performance; sticky CTA bar pinned above the safe area.

-----

## 12. Visual Design System

- **Palette:** Terminal Black `#0A0A0C` / Daemon Green `#4ADE80` / Duke Blue `#5B7FDB` / Signal White `#F5F5F0` (dark); Paper White `#F7F6F2` / Ink `#111318` (light)
- **Type scale:** Display — JetBrains Mono, 800 weight for hero, 600 for section heads; Body — Inter, 400/500
- **Radius:** Sharp-ish, 4–8px — terminal windows aren’t rounded pill shapes; avoid the default shadcn 12px+ rounded-everything look
- **Cards:** “Terminal window” card treatment — top bar with 3 dots, monospace file-path label, content area below (signature card style used for both project cards and pricing cards)
- **Buttons:** Primary = solid Daemon Green with black text + subtle scanline hover; Secondary = outlined Duke Blue with glow-on-hover
- **Icons:** Lucide, monostroke, wrapped in `[ ]` bracket badges
- **Nav/footer:** Terminal title-bar header; footer styled as a closing shell prompt
- **Cursor:** Custom blinking block cursor on desktop pointer (progressive enhancement, disabled on touch)
- **Loading/empty states:** Skeletons rendered as scanning/loading-bar terminal animations, not generic grey pulse blocks
- **Foundation:** bespoke React components and a custom CSS token system; no generic component-library defaults are visible in the shipped site.

-----

## 13–17. Architecture, Monorepo, Frontend, Adapters, Backend

**Framework:** React Router v7+ on Cloudflare Pages (default rule applies — no Next.js/Vercel signal present).

**Stack:** Cloudflare Pages + Pages Functions · React Router v7 · TypeScript · Vite · pnpm workspaces · bespoke CSS design system · Lucide React and technology brand icons · IntersectionObserver/pointer-event motion system · D1 · KV (rate-limit/cache support) · R2 (project screenshots and PDF media) · Cloudflare Turnstile · Google Apps Script MailApp relay · bank transfer (details shared privately after quote acceptance) · consent-gated Plausible support.

**Monorepo:**

```
apps/web/
apps/web/functions/          # Pages Functions: contact, leads, admin auth, daemon-log
packages/ui/                 # shared components incl. TerminalWindow, DaemonWidget, DecryptText
packages/db/                 # portable SQL schema and migrations
packages/db-adapters/cloudflare-d1/
packages/db-adapters/supabase/
packages/types/
packages/validators/         # Zod schemas: leadForm, projectSchema, pricingTierSchema
tools/google-apps-script/    # Free Gmail notification relay
packages/seo/
packages/analytics/
packages/payments/           # portable bank-transfer instructions adapter
packages/storage/            # R2 adapter + supabase-storage fallback
packages/cache/
packages/auth/               # admin login only
packages/cookie-consent/
```

**Pages Functions:** `POST /api/contact` (lead capture), `POST /api/daemon/log` (optional: store interesting DAEMON session events for Duke’s own curiosity — anonymised, opt-in via cookie consent), `POST /api/admin/*` (protected CRUD). Bank details are never exposed through a public endpoint.

**D1 tables:** `projects`, `testimonials`, `pricing_tiers`, `leads`, `blog_posts` (optional), `admin_users`, `daemon_commands` (so Duke can add/edit terminal command responses from the admin dashboard without a redeploy), `cookie_consents`.

Keep all logic behind adapters exactly per the standard portability rule — nothing Cloudflare-specific leaks into UI components.

-----

## 18. Database Schema (key tables)

**`projects`** — id, slug, title, description, problem, solution, stack (json array), result_metrics (json), screenshot_r2_keys (json array), live_url, demo_flag (bool), demo_note, category, featured (bool), sort_order, created_at

**`testimonials`** — id, author_name, author_role, company, quote, sort_order

**`pricing_tiers`** — id, name, price_gbp, description, features (json array), is_popular (bool), sort_order

**`leads`** — id, name, email, company, project_type, budget_range, message, status (new/contacted/quoted/won/lost), created_at

**`daemon_commands`** — id, command, response_text, action_type (scroll/open-form/link/text), action_target, is_active

**`admin_users`** — id, email, password_hash, last_login

All portable to Supabase Postgres with equivalent column types; R2 keys map to Supabase Storage object paths.

-----

## 19. Admin Dashboard (Tier 3+ feature, included)

Login-gated `/admin`. Manage: projects (add/edit/reorder/feature, upload screenshots to R2), testimonials, pricing tiers, leads (view/export/status), DAEMON command library (add new terminal responses without a redeploy — genuinely useful given the interactive concept), business settings (email, WhatsApp number, public phone, hours). Clean and usable by Duke on mobile between client calls.

-----

## 20–22. Forms, API, Auth

Contact form: name, email, company (optional), project type (select), budget range (select), message — Zod-validated client+server, Turnstile-protected, GDPR consent checkbox with link to Privacy Policy. Admin auth: email + password (hashed), simple session cookie, no public registration, CSRF protection on all mutating routes, rate-limited login attempts.

-----

## 23. Payments

No shop, card checkout or customer accounts. **Bank transfer is the only payment method currently available.** Payment instructions are sent privately in the accepted quote/invoice; no bank details are exposed in client-side code. No VAT display while unregistered.

-----

## 24–27. Technical SEO, Performance, Accessibility, GDPR

Standard implementation per framework: dynamic meta/OG/Twitter cards, XML sitemap, robots.txt, JSON-LD per page type, Core Web Vitals-optimised (lazy-loaded screenshots, code-split DAEMON widget so it never blocks first paint), WCAG 2.1 AA with reduced-motion fallbacks for every animated element, opt-in granular cookie consent banner styled in the terminal theme (not a bare default banner), UK GDPR-compliant Privacy/Cookie/Terms pages, lead form consent notice.

-----

## 28. Deployment

**Cloudflare Pages** (default, matches framework choice). Project root: `apps/web`; build command: `pnpm build`; output: `build/client`; Functions dir: `functions`; D1/KV/R2 bindings via `apps/web/wrangler.toml`, scoped as above; Turnstile and the Google Apps Script relay values are encrypted environment variables; preview deployments per PR, production on `main`.

-----

## 29. Portability Notes

D1 → Supabase Postgres; R2 → Supabase Storage; Pages Functions → Netlify Functions if ever migrated; keep bank-transfer instructions, notification delivery and Turnstile calls behind small server-side adapters so none of it is Cloudflare-locked.

-----

## 30. Content & Copywriting Pack

**Hero headline options:**

1. “I build things that work — and occasionally talk back.”
1. “Code by day. Systems nerd by nature. Website that’s actually alive.”
1. “Full-stack developer. AI automation specialist. Currently watching you scroll.”

**CTA button text:** `Start a project →` · `Let's talk` · `View live work` · `sudo hire-duke`

**Why choose me bullets:**

- I ship live, production-grade builds — not mockups (see the links, click them yourself)
- AI-assisted, agentic development means faster turnaround without cutting corners
- First-Class Honours discipline applied to messy, real-world business problems
- I explain what I’m doing in plain English, not jargon

**WhatsApp message template:** `Hi Duke, I found your site and want to talk about a project.`

**GDPR data notice (short form):** “I’ll only use your details to reply to your enquiry. No spam, no third-party sharing. Full Privacy Policy [here].”

**Cookie banner copy:** “This site uses a few cookies to keep things running smoothly and to understand what’s working. Nothing creepy — you choose what’s on.” [Accept all] [Necessary only] [Manage preferences]

-----

## 31. Lead Capture & Contact Flow

Contact form → Pages Function validates + Turnstile-checks → stored in `leads` (D1) → one Google Apps Script MailApp notification to the configured Gmail account → prefilled follow-up from [buildwithduke@outlook.com](mailto:buildwithduke@outlook.com) in Outlook → optional WhatsApp deep link as a faster alternative route, always visible alongside the form, never gated behind it.

-----

## 32. Industry-Specific Notes

As a developer-portfolio-as-agency site, the “industry” IS the product: every trust signal must be independently verifiable (real GitHub links, real live URLs, real metrics with an honest “these are self-reported client results” note until third-party verification exists). Demo-labelled client projects must say so clearly and respectfully — this protects both Duke’s credibility and the named clients.

-----

## 33. Final Copy-Paste Build Prompt (for a developer / AI coding agent)

```
Build "buildwithduke" — a Tier 4 (Premium), fully interactive personal portfolio and
freelance-agency web app for Duke Chijimaka Jonathan, a UK-remote full-stack developer
and AI automation specialist.

BRAND: Black canvas (#0A0A0C), Daemon Green (#4ADE80), Duke Blue (#5B7FDB), Signal
White (#F5F5F0). Logo is a monospace "<BUILD WITH DUKE/>" wordmark forming a cube in
green/white/blue. Design direction: Minimalist Dark hybridised with Cyberpunk/Glitch
terminal accents ("Terminal-Noir") — restrained dark UI skeleton, terminal/CLI
behaviour as the nervous system. Include a full light/dark (sun/moon) toggle; light
mode is a "printed manpage" paper-white inversion, not a generic SaaS flip.

SIGNATURE ELEMENT — "DAEMON": build a persistent, dismissible terminal-styled
companion widget (bottom-right desktop, bottom-sheet on mobile) that:
- Runs a boot sequence animation on first load
- Prints live, reactive "system log" lines based on real visitor behaviour
  (section in view, idle time, scroll depth, clicks) — genuinely reactive, not looped
- Accepts typed commands: help, whoami, projects, contact, pricing, sudo hire-duke,
  coffee — each triggers a real site action (scroll-to, open pre-filled contact form,
  navigate, easter-egg response)
- Command/response library is editable from the admin dashboard without a redeploy

SITE VOICE: First person throughout ("I build...", never "we"). Tone: calm, dry,
quietly funny, technically credible cool-nerd — reflect Duke's LinkedIn About voice
(systems-thinker, "messy things make sense," origami/astronomy/theology interests,
"agentic vibe coding," first-class LIS degree, 65% workload reduction, 73% lead
growth, 1M+ TikTok views in 7 days for a real estate client, 99% data integrity,
SUSI 2025 US State Dept exchange alumnus, Best Graduating Student 2025).

SITEMAP: Home, /projects (+ /projects/[slug] case studies), /about, /pricing,
/services, /blog (optional), /contact, /cv, /privacy, /cookies, /terms, /admin/*.

PROJECTS TO FEATURE (label demo builds honestly — "Demo build, live client agreement
in place" — never presented as the client's real production site):
- EventStreamHD (eventstreamhd.cam) — streaming platform, custom admin CRUD
- Folder-to-text merger (filescombiner.netlify.app) — private in-browser file utility
- Fraser James Mobile Hairdresser (jamesfrazer.pages.dev) — UK live client site
- The Grills Corner (Nigeria) — demo build, label country clearly
- Home Away Travels (Nigeria) — demo build, label country clearly
- Koha ISBD Cataloguing Assistant Plugin (GitHub) — production open-source plugin
- Sora Streamlit Studio — AI video pipeline, Streamlit
- n8n workflow repo (LinkedIn Job Hunt Pipeline, WordPress Auto-Poster)
Each project card: terminal/browser-framed screenshot, stack tags, Visit + Case
Study buttons, and (if demo) a visible demo note.

PRICING SECTION (Duke's own client-facing packages — show all 5, highlight
"Professional" as Most Popular):
Tier 1 Foundation £499 · Tier 2 Growth £999 · Tier 3 Professional £1,499 (Most
Popular) · Tier 4 Premium £1,999 · Tier 5 Custom (quote on application).
Style pricing cards as terminal windows, not default SaaS pricing table.

CONTACT: buildwithduke@outlook.com, public phone/WhatsApp +234 915 215 1634, WhatsApp click-to-chat, contact form (name, email, company, project
type, budget range, message) with Turnstile + GDPR consent checkbox, stored in D1,
Free Gmail notification through a shared-secret Google Apps Script relay.

TECH STACK: Cloudflare Pages + Pages Functions, React Router v7+, TypeScript, Vite,
pnpm workspaces, a bespoke CSS token/component system, Lucide icons
(bracket-wrapped and restyled), a custom IntersectionObserver/pointer-event motion
system, D1, KV and R2
(project screenshots + CV PDF), Cloudflare Turnstile, Google Apps Script MailApp, bank transfer only
(private instructions after quote acceptance; no checkout or customer accounts), GA4 or Plausible.

MONOREPO: apps/web (+ apps/web/functions), packages/ui, db, db-adapters
(cloudflare-d1, supabase), types, validators, email, seo, analytics, payments,
storage, cache, auth, cookie-consent. Keep all Cloudflare-specific code behind
adapters for Netlify/Supabase portability.

D1 SCHEMA: projects, testimonials, pricing_tiers, leads, blog_posts, admin_users,
daemon_commands, cookie_consents — as detailed in Section 18 of the accompanying
strategy document.

ADMIN DASHBOARD (/admin, login-gated): manage projects, testimonials, pricing
tiers, leads (view/export/status), DAEMON command library, business settings.
custom Terminal-Noir UI, mobile-usable, protected routes, confirmation dialogs on delete.

ANTI-GENERIC REQUIREMENTS: no centred-hero-gradient-blob default; no generic
component-library styling; no purple-blue gradient clichés; at least one
deliberately asymmetric/broken-grid section (featured projects grid); a distinctive
type pairing (JetBrains Mono / Space Mono display + Inter body); custom "terminal
window" card treatment used for project cards, pricing cards, and testimonials;
section rhythm variation across the homepage; considered micro-interactions
respecting prefers-reduced-motion.

ACCESSIBILITY: WCAG 2.1 AA minimum, all decorative text/glitch effects have real
static text in the DOM and a reduced-motion fallback, 4.5:1 contrast minimum even
within the dark terminal palette, full keyboard operability of DAEMON's command
input, skip-to-content link.

UK GDPR: opt-in granular cookie consent (Necessary/Analytics/Marketing) styled in
theme, Privacy/Cookie/Terms pages, GDPR consent notice on contact form, admin
export/delete-on-request capability for leads.

DEPLOYMENT: Cloudflare Pages, project root apps/web, build command pnpm build,
output build/client, Functions dir functions, D1/KV/R2 bindings via
apps/web/wrangler.toml, Turnstile and contact-relay values as encrypted env
vars. Document Netlify/Supabase portability path in README.

FOOTER: no external agency credit line (Duke IS buildwithduke). Show the copyright
brand as "Build With Duke" and a small terminal-style "// built with ❤️" line.

Deliver a stunning, unmistakably-Duke, production-ready build — this must not be
mistakable for a generic developer portfolio template with the colours changed.
```

-----

## 35. Production Readiness Checklist

- [x] All sitemap pages built and responsive
- [x] DAEMON functional, reactive, draggable, keyboard-accessible, and reduced-motion aware
- [x] Terminal-Noir design system applied consistently
- [x] Retained Linktree project inventory reflected; excluded projects filtered from static and D1 content
- [x] Real project links verified live; demo-labelled projects clearly marked
- [x] SEO basics (route meta, sitemap, robots.txt, schema) in place
- [x] AI SEO Business Facts block present
- [x] Local/UK relevance signals present (GBP pricing, UK hours, WhatsApp, public phone)
- [x] Contact form implementation includes Turnstile, D1 storage, private Gmail notifications, validation and rate limiting
- [x] Admin dashboard supports projects, testimonials, pricing, leads, posts, settings and DAEMON commands
- [x] Granular cookie consent plus Privacy/Cookie/Terms pages implemented
- [x] Keyboard, focus, semantic, contrast and reduced-motion safeguards implemented
- [x] Root Wrangler build/output configuration checked in for monorepo deployment
- [x] Portability and production environment instructions documented in README
- [x] CV PDF, headshot, logo and real project captures included

Deployment bindings and encrypted secrets remain environment-owned Cloudflare settings; the repository fails closed when security-critical production configuration is absent.

```
