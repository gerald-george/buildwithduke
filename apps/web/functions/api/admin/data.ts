import { AdminEnv, requireAdmin } from "./_auth";

type ModuleName = keyof typeof definitions;
type RecordValue = Record<string, unknown>;
const definitions = {
  projects: { table: "projects", columns: ["slug", "title", "eyebrow", "description", "problem", "solution", "result", "stack", "result_metrics", "screenshot_r2_keys", "image", "live_url", "demo_flag", "demo_note", "category", "featured", "sort_order"], order: "featured DESC, sort_order ASC, created_at DESC" },
  testimonials: { table: "testimonials", columns: ["author_name", "author_role", "company", "quote", "sort_order"], order: "sort_order ASC" },
  pricing: { table: "pricing_tiers", columns: ["name", "price_gbp", "description", "features", "is_popular", "sort_order"], order: "sort_order ASC" },
  leads: { table: "leads", columns: ["status"], order: "created_at DESC" },
  commands: { table: "daemon_commands", columns: ["command", "response_text", "action_type", "action_target", "is_active"], order: "command ASC" },
  posts: { table: "blog_posts", columns: ["slug", "title", "excerpt", "body", "status", "published_at"], order: "created_at DESC" },
  settings: { table: "business_settings", columns: ["key", "value"], order: "key ASC" },
} as const;

const definitionFor = (value: string | null) => value && value in definitions ? definitions[value as ModuleName] : null;

export const onRequestGet: PagesFunction<AdminEnv> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env);
  if (auth.error) return auth.error;
  if (!env.DB) return Response.json({ error: "The D1 database binding is not configured." }, { status: 503 });
  const module = new URL(request.url).searchParams.get("module");
  const definition = definitionFor(module);
  if (!definition) return Response.json({ error: "Unknown admin module." }, { status: 400 });
  const rows = (await env.DB.prepare(`SELECT * FROM ${definition.table} ORDER BY ${definition.order}`).all()).results;
  return Response.json({ rows }, { headers: { "Cache-Control": "no-store" } });
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
    await env.DB.prepare(`DELETE FROM ${definition.table} WHERE id = ?`).bind(String(body.id || "")).run();
    return Response.json({ ok: true });
  }
  const record = body.record || {};
  const columns = definition.columns.filter(column => Object.prototype.hasOwnProperty.call(record, column));
  if (!columns.length) return Response.json({ error: "No editable fields were supplied." }, { status: 400 });
  const values = columns.map(column => typeof record[column] === "boolean" ? (record[column] ? 1 : 0) : record[column] ?? null);
  if (action === "create") {
    if (body.module === "leads") return Response.json({ error: "Leads are created through the contact form." }, { status: 400 });
    const id = crypto.randomUUID();
    await env.DB.prepare(`INSERT INTO ${definition.table} (id, ${columns.join(", ")}) VALUES (?, ${columns.map(() => "?").join(", ")})`).bind(id, ...values).run();
    return Response.json({ ok: true, id }, { status: 201 });
  }
  const id = String(record.id || "");
  if (!id) return Response.json({ error: "The record id is missing." }, { status: 400 });
  await env.DB.prepare(`UPDATE ${definition.table} SET ${columns.map(column => `${column} = ?`).join(", ")} WHERE id = ?`).bind(...values, id).run();
  return Response.json({ ok: true });
}
