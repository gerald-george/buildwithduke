import { pricing, projects } from "../../../src/data";
import { pageDefinitions } from "../../../src/pageContent";
import { CONTACT_EMAIL, GITHUB_URL, INSTAGRAM_URL, LINKEDIN_URL, PHONE_DISPLAY, PHONE_NUMBER } from "../../../src/site";

const bootstrapId = "managed-defaults-v1";
let bootstrapPromise: Promise<void> | undefined;

const settings = [
  ["business_name", "Build With Duke"],
  ["contact_email", CONTACT_EMAIL],
  ["phone_number", PHONE_NUMBER],
  ["phone_display", PHONE_DISPLAY],
  ["whatsapp_number", PHONE_NUMBER],
  ["service_area", "Remote · UK-wide"],
  ["response_time", "within 24 hours, UK time"],
  ["github_url", GITHUB_URL],
  ["instagram_url", INSTAGRAM_URL],
  ["linkedin_url", LINKEDIN_URL],
  ["accepting_projects", "true"],
  ["visitor_guide_enabled", "true"],
  ["industry", "Full-stack web development and AI automation consultancy"],
  ["business_hours", '{"days":"Monday–Sunday","opens":"09:00","closes":"22:59","timezone":"GMT/BST"}'],
  ["payment_methods", "Bank transfer only"],
] as const;

const commands = [
  ["cv", "Opening Duke’s full CV, experience and credentials.", "navigate", "/cv"],
  ["articles", "Opening Duke’s articles.", "navigate", "/articles"],
  ["github", "Opening Duke’s public GitHub profile.", "link", GITHUB_URL],
  ["whatsapp", "Opening a private WhatsApp conversation.", "link", `https://wa.me/${PHONE_NUMBER.replace(/\D/g, "")}`],
  ["privacy", "Opening the privacy policy.", "navigate", "/privacy"],
  ["cookies", "Opening the cookie policy.", "navigate", "/cookies"],
] as const;

export function ensureManagedDefaults(db: D1Database) {
  if (!bootstrapPromise) bootstrapPromise = applyManagedDefaults(db).catch(error => { bootstrapPromise = undefined; throw error; });
  return bootstrapPromise;
}

async function applyManagedDefaults(db: D1Database) {
  await db.prepare("CREATE TABLE IF NOT EXISTS content_bootstraps (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now')))").run();
  const applied = await db.prepare("SELECT id FROM content_bootstraps WHERE id = ?").bind(bootstrapId).first();
  if (applied) return;

  const projectStatements = projects.map((project, index) => db.prepare(`
    INSERT OR IGNORE INTO projects
      (id, slug, title, eyebrow, description, problem, solution, result, stack, result_metrics, screenshot_r2_keys, image, live_url, demo_flag, demo_note, category, featured, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '{}', '[]', ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    `project-${project.slug}`, project.slug, project.title, project.eyebrow, project.description, project.problem, project.solution, project.result,
    JSON.stringify(project.stack), project.image, project.liveUrl, project.demo ? 1 : 0,
    project.demo ? "Mockup build with a live client agreement in place." : "", project.category, project.featured ? 1 : 0, index * 10,
  ));
  const pricingStatements = pricing.map((tier, index) => db.prepare(`
    INSERT OR IGNORE INTO pricing_tiers (id, name, price_gbp, description, features, is_popular, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    `pricing-${tier.name.toLowerCase()}`, tier.name, tier.price.startsWith("£") ? Number(tier.price.slice(1).replaceAll(",", "")) : null,
    tier.note, JSON.stringify(tier.features), tier.popular ? 1 : 0, index * 10,
  ));
  const pageStatements = pageDefinitions.map((page, index) => db.prepare(`
    INSERT OR IGNORE INTO page_content (id, slug, name, seo_title, meta_description, content, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(`page-${page.slug}`, page.slug, page.name, page.seoTitle, page.metaDescription, JSON.stringify(page.content), (index + 1) * 10));
  const settingStatements = settings.map(([key, value]) => db.prepare(`
    INSERT OR IGNORE INTO business_settings (id, key, value) VALUES (?, ?, ?)
  `).bind(`setting-${key.replaceAll("_", "-")}`, key, value));
  const commandStatements = commands.map(([command, response, action, target]) => db.prepare(`
    INSERT OR IGNORE INTO daemon_commands (id, command, response_text, action_type, action_target) VALUES (?, ?, ?, ?, ?)
  `).bind(`daemon-${command}`, command, response, action, target));

  await db.batch([...projectStatements, ...pricingStatements, ...pageStatements, ...settingStatements, ...commandStatements]);
  await db.prepare("INSERT OR IGNORE INTO content_bootstraps (id) VALUES (?)").bind(bootstrapId).run();
}
