import { AdminEnv, adminDatabaseError, requireAdmin } from "./_auth";
import { sanitizeArticleHtml } from "../_shared/html";
import { ensureManagedDefaults } from "../_shared/managed-defaults";

type ModuleName = keyof typeof definitions;
type RecordValue = Record<string, unknown>;
const definitions = {
  pages: { table: "page_content", columns: ["slug", "name", "seo_title", "meta_description", "content", "sort_order"], order: "sort_order ASC" },
  projects: { table: "projects", columns: ["slug", "title", "eyebrow", "description", "problem", "solution", "result", "stack", "result_metrics", "screenshot_r2_keys", "image", "live_url", "demo_flag", "demo_note", "category", "featured", "sort_order"], order: "featured DESC, sort_order ASC, created_at DESC" },
  testimonials: { table: "testimonials", columns: ["author_name", "author_role", "company", "quote", "sort_order"], order: "sort_order ASC" },
  pricing: { table: "pricing_tiers", columns: ["name", "price_gbp", "description", "features", "is_popular", "sort_order"], order: "sort_order ASC" },
  leads: { table: "leads", columns: ["status"], order: "created_at DESC" },
  commands: { table: "daemon_commands", columns: ["command", "response_text", "action_type", "action_target", "is_active"], order: "command ASC" },
  posts: { table: "blog_posts", columns: ["slug", "title", "excerpt", "body", "status", "published_at", "seo_title", "meta_description", "cover_image", "focus_keyword", "source_urls", "ai_generated", "ai_model", "content_fingerprint"], order: "created_at DESC" },
  settings: { table: "business_settings", columns: ["key", "value"], order: "key ASC" },
} as const;

const publicSettingKeys = ["business_name", "contact_email", "phone_number", "phone_display", "whatsapp_number", "service_area", "response_time", "github_url", "instagram_url", "linkedin_url", "accepting_projects", "visitor_guide_enabled", "industry", "business_hours", "payment_methods"] as const;
const leadStatuses = ["new", "contacted", "quoted", "won", "lost"];
const postStatuses = ["draft", "published"];
const pageSlugs = ["home", "projects", "services", "pricing", "about", "contact", "cv", "blog", "privacy", "cookies", "terms", "common"];

const definitionFor = (value: string | null) => value && value in definitions ? definitions[value as ModuleName] : null;

export const onRequestGet: PagesFunction<AdminEnv> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env);
  if (auth.error) return auth.error;
  if (!env.DB) return Response.json({ error: "The D1 database binding is not configured." }, { status: 503 });
  const module = new URL(request.url).searchParams.get("module");
  try {
    await ensureManagedDefaults(env.DB);
    if (module === "overview") {
      const [pages, projects, testimonials, pricing, leads, commands, posts, settings, newLeads, draftPosts, publishedPosts, recentLeads] = await Promise.all([
        count(env.DB, "page_content").catch(() => 0),
        count(env.DB, "projects"), count(env.DB, "testimonials"), count(env.DB, "pricing_tiers"), count(env.DB, "leads"),
        count(env.DB, "daemon_commands", "is_active = 1"), count(env.DB, "blog_posts"), count(env.DB, "business_settings"),
        count(env.DB, "leads", "status = 'new'"), count(env.DB, "blog_posts", "status = 'draft'"), count(env.DB, "blog_posts", "status = 'published'"),
        env.DB.prepare("SELECT id, name, email, project_type, status, created_at FROM leads ORDER BY created_at DESC LIMIT 5").all(),
      ]);
      return Response.json({ counts: { pages, projects, testimonials, pricing, leads, commands, posts, settings }, newLeads, draftPosts, publishedPosts, recentLeads: recentLeads.results }, { headers: { "Cache-Control": "no-store" } });
    }
    const definition = definitionFor(module);
    if (!definition) return Response.json({ error: "Unknown admin module." }, { status: 400 });
    const rows = (await env.DB.prepare(`SELECT * FROM ${definition.table} ORDER BY ${definition.order}`).all()).results;
    return Response.json({ rows }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return adminDatabaseError(error);
  }
};

export const onRequestPost: PagesFunction<AdminEnv> = async context => mutate(context, "create");
export const onRequestPut: PagesFunction<AdminEnv> = async context => mutate(context, "update");
export const onRequestDelete: PagesFunction<AdminEnv> = async context => mutate(context, "delete");

async function mutate({ request, env }: EventContext<AdminEnv, string, unknown>, action: "create" | "update" | "delete") {
  const auth = await requireAdmin(request, env, true);
  if (auth.error) return auth.error;
  if (!env.DB) return Response.json({ error: "The D1 database binding is not configured." }, { status: 503 });
  const body = await request.json<{ module?: string; record?: RecordValue; id?: unknown }>().catch(() => null);
  const definition = definitionFor(body?.module || null);
  if (!body || !definition) return Response.json({ error: "Invalid admin request." }, { status: 400 });
  if (action === "delete") {
    if (body.module === "leads") return Response.json({ error: "Lead deletion is handled through data-rights workflow." }, { status: 400 });
    if (body.module === "pages") return Response.json({ error: "Core site pages cannot be deleted." }, { status: 400 });
    const id = String(body.id || "");
    if (!id) return Response.json({ error: "The record id is missing." }, { status: 400 });
    await env.DB.prepare(`DELETE FROM ${definition.table} WHERE id = ?`).bind(id).run();
    return Response.json({ ok: true });
  }
  const record = body.record || {};
  if (body.module === "posts" && typeof record.body === "string") record.body = sanitizeArticleHtml(record.body);
  if (body.module === "posts" && record.status === "published" && !record.published_at) record.published_at = new Date().toISOString();
  const validationError = validateRecord(body.module as ModuleName, record);
  if (validationError) return Response.json({ error: validationError }, { status: 400 });
  const columns = definition.columns.filter(column => Object.prototype.hasOwnProperty.call(record, column));
  if (!columns.length) return Response.json({ error: "No editable fields were supplied." }, { status: 400 });
  const values = columns.map(column => typeof record[column] === "boolean" ? (record[column] ? 1 : 0) : record[column] ?? null);
  if (action === "create") {
    if (body.module === "leads") return Response.json({ error: "Leads are created through the contact form." }, { status: 400 });
    const id = crypto.randomUUID();
    try {
      await env.DB.prepare(`INSERT INTO ${definition.table} (id, ${columns.join(", ")}) VALUES (?, ${columns.map(() => "?").join(", ")})`).bind(id, ...values).run();
      return Response.json({ ok: true, id }, { status: 201 });
    } catch (error) { return databaseError(error); }
  }
  const id = String(record.id || "");
  if (!id) return Response.json({ error: "The record id is missing." }, { status: 400 });
  try {
    await env.DB.prepare(`UPDATE ${definition.table} SET ${columns.map(column => `${column} = ?`).join(", ")} WHERE id = ?`).bind(...values, id).run();
    return Response.json({ ok: true });
  } catch (error) { return databaseError(error); }
}

async function count(db: D1Database, table: string, where?: string) {
  const row = await db.prepare(`SELECT COUNT(*) AS total FROM ${table}${where ? ` WHERE ${where}` : ""}`).first<{ total: number }>();
  return Number(row?.total || 0);
}

function validateRecord(module: ModuleName, record: RecordValue) {
  const required: Partial<Record<ModuleName, string[]>> = {
    pages: ["slug", "name", "seo_title", "meta_description", "content"],
    projects: ["slug", "title", "description", "category"], testimonials: ["author_name", "quote"], pricing: ["name", "description"],
    commands: ["command", "response_text"], posts: ["slug", "title", "body", "status"], settings: ["key", "value"], leads: ["status"],
  };
  const missing = required[module]?.find(key => !String(record[key] ?? "").trim());
  if (missing) return `The ${missing.replaceAll("_", " ")} field is required.`;
  if ((module === "projects" || module === "posts") && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(record.slug || ""))) return "The URL slug must contain lowercase letters, numbers and single hyphens only.";
  if (module === "pages" && !pageSlugs.includes(String(record.slug))) return "Choose a supported public page.";
  if (module === "pages") {
    let content: unknown = record.content;
    try { if (typeof content === "string") content = JSON.parse(content); } catch { return "Page content could not be read."; }
    if (!content || typeof content !== "object" || Array.isArray(content)) return "Page content must use the structured editor.";
    const invalid = Object.values(content as Record<string, unknown>).some(value => typeof value !== "string" && (!Array.isArray(value) || value.some(item => typeof item !== "string")));
    if (invalid) return "Page content contains an unsupported value.";
  }
  if (module === "leads" && !leadStatuses.includes(String(record.status))) return "Choose a valid lead status.";
  if (module === "posts" && !postStatuses.includes(String(record.status))) return "Choose a valid publishing status.";
  if (module === "posts" && record.published_at && Number.isNaN(Date.parse(String(record.published_at)))) return "Choose a valid publish date and time.";
  if (module === "posts" && String(record.seo_title || "").length > 80) return "Keep the SEO title at 80 characters or fewer.";
  if (module === "posts" && String(record.meta_description || "").length > 180) return "Keep the meta description at 180 characters or fewer.";
  if (module === "posts" && record.source_urls) {
    let sourceUrls: unknown = record.source_urls;
    try { if (typeof sourceUrls === "string") sourceUrls = JSON.parse(sourceUrls); } catch { return "Research sources must be a list of URLs."; }
    if (!Array.isArray(sourceUrls) || sourceUrls.some(value => !isHttpUrl(value))) return "Every research source must use an http or https URL.";
  }
  if (module === "projects" && !["Web development", "AI automation", "Software"].includes(String(record.category))) return "Choose a valid project category.";
  if (module === "settings" && !publicSettingKeys.includes(String(record.key) as typeof publicSettingKeys[number])) return "Choose an approved public business setting.";
  if (module === "settings" && String(record.key).endsWith("_url") && !isHttpUrl(record.value)) return "Public social links must use an http or https URL.";
  if (module === "projects" && record.live_url && !isHttpUrl(record.live_url)) return "The live project link must use an http or https URL.";
  if (module === "commands" && !["text", "navigate", "link", "theme"].includes(String(record.action_type || "text"))) return "Choose a valid command action.";
  for (const [key, value] of Object.entries(record)) if (typeof value === "string" && value.length > (key === "body" ? 250_000 : 20_000)) return `The ${key.replaceAll("_", " ")} field is too long.`;
  return "";
}

function isHttpUrl(value: unknown) {
  try { return ["http:", "https:"].includes(new URL(String(value)).protocol); } catch { return false; }
}

function databaseError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (/no such table|no such column/i.test(message)) return adminDatabaseError(error);
  if (/unique|constraint/i.test(message)) return Response.json({ error: "A record with that slug, key or command already exists." }, { status: 409 });
  return Response.json({ error: "The database could not save this record." }, { status: 500 });
}
