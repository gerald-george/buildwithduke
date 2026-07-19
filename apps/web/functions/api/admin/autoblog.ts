import { requireAdmin, type AdminEnv } from "./_auth";
import { runAutoblog, type AutoblogEnv, type AutoblogSettings } from "../_shared/autoblog";

type Env = AdminEnv & AutoblogEnv;
const editable = ["enabled", "interval_hours", "topics", "model", "search_country", "search_language", "publish_mode", "min_words", "max_posts_per_month", "similarity_threshold"] as const;

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env);
  if (auth.error) return auth.error;
  if (!env.DB) return Response.json({ error: "The D1 database binding is not configured." }, { status: 503 });
  const [settings, runs] = await Promise.all([
    env.DB.prepare("SELECT * FROM autoblog_settings WHERE id = 'primary'").first(),
    env.DB.prepare("SELECT id, status, trigger_type, query, article_id, model, similarity_score, message, started_at, completed_at FROM autoblog_runs ORDER BY started_at DESC LIMIT 20").all(),
  ]);
  return Response.json({ settings, runs: runs.results, configured: { openrouter: Boolean(env.OPENROUTER_API_KEY), serpapi: Boolean(env.SERPAPI_API_KEY), scheduler: Boolean(env.AUTOBLOG_CRON_SECRET) } }, { headers: { "Cache-Control": "no-store" } });
};

export const onRequestPut: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env, true);
  if (auth.error) return auth.error;
  if (!env.DB) return Response.json({ error: "The D1 database binding is not configured." }, { status: 503 });
  const body = await request.json<{ settings?: Record<string, unknown> }>().catch(() => null);
  const value = body?.settings || {};
  const error = validate(value);
  if (error) return Response.json({ error }, { status: 400 });
  const columns = editable.filter(key => key in value);
  if (!columns.length) return Response.json({ error: "No autoblog settings were supplied." }, { status: 400 });
  const values = columns.map(key => key === "topics" && Array.isArray(value[key]) ? JSON.stringify(value[key]) : typeof value[key] === "boolean" ? (value[key] ? 1 : 0) : value[key]);
  await env.DB.prepare(`UPDATE autoblog_settings SET ${columns.map(key => `${key} = ?`).join(", ")}, next_run_at = CASE WHEN enabled = 0 AND ? = 1 THEN datetime('now') ELSE next_run_at END, updated_at = datetime('now') WHERE id = 'primary'`)
    .bind(...values, value.enabled ? 1 : 0).run();
  return Response.json({ ok: true });
};

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env, true);
  if (auth.error) return auth.error;
  try { return Response.json(await runAutoblog(env, "manual")); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Autoblog failed." }, { status: 500 }); }
};

function validate(value: Record<string, unknown>) {
  if ("interval_hours" in value && (Number(value.interval_hours) < 6 || Number(value.interval_hours) > 2160)) return "Choose an interval between 6 and 2,160 hours.";
  if ("min_words" in value && (Number(value.min_words) < 600 || Number(value.min_words) > 3000)) return "Choose an article length between 600 and 3,000 words.";
  if ("max_posts_per_month" in value && (Number(value.max_posts_per_month) < 1 || Number(value.max_posts_per_month) > 31)) return "Choose a monthly limit between 1 and 31.";
  if ("similarity_threshold" in value && (Number(value.similarity_threshold) < .35 || Number(value.similarity_threshold) > .85)) return "Choose a similarity threshold between 0.35 and 0.85.";
  if ("publish_mode" in value && !["draft", "published"].includes(String(value.publish_mode))) return "Choose draft review or automatic publishing.";
  if ("model" in value && !/^[a-z0-9_.~:-]+\/[a-z0-9_.~:-]+$/i.test(String(value.model))) return "Enter a valid OpenRouter model slug.";
  if ("topics" in value) {
    const topics = Array.isArray(value.topics) ? value.topics.map(String) : [];
    if (!topics.length || topics.length > 20 || topics.some(topic => !topic.trim() || topic.length > 120)) return "Add between 1 and 20 focused topics.";
  }
  return "";
}
