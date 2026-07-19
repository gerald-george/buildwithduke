import { escapeHtml, sanitizeArticleHtml, stripHtml } from "./html";

export interface AutoblogEnv {
  DB?: D1Database;
  OPENROUTER_API_KEY?: string;
  SERPAPI_API_KEY?: string;
  AUTOBLOG_CRON_SECRET?: string;
}

export type AutoblogSettings = {
  id: string; enabled: number; interval_hours: number; topics: string; model: string; search_country: string;
  search_language: string; publish_mode: "draft" | "published"; min_words: number; max_posts_per_month: number;
  similarity_threshold: number; last_run_at: string | null; next_run_at: string | null; updated_at: string;
};

type SearchItem = { title?: string; link?: string; snippet?: string; source?: string; date?: string };
type SerpPayload = {
  organic_results?: SearchItem[]; news_results?: SearchItem[];
  related_searches?: Array<{ query?: string }>;
};

type GeneratedArticle = { title?: string; excerpt?: string; seoTitle?: string; metaDescription?: string; focusKeyword?: string; bodyHtml?: string };

export async function runAutoblog(env: AutoblogEnv, trigger: "schedule" | "manual") {
  if (!env.DB) throw new Error("The D1 database binding is not configured.");
  if (!env.OPENROUTER_API_KEY || !env.SERPAPI_API_KEY) throw new Error("OpenRouter and SerpApi secrets must both be configured.");
  const settings = await env.DB.prepare("SELECT * FROM autoblog_settings WHERE id = 'primary'").first<AutoblogSettings>();
  if (!settings) throw new Error("Autoblog settings have not been migrated.");
  if (trigger === "schedule" && !settings.enabled) return { status: "skipped", message: "Scheduled autoblogging is disabled." };
  if (trigger === "schedule" && settings.next_run_at && Date.parse(settings.next_run_at) > Date.now()) {
    return { status: "skipped", message: `The next article is due ${settings.next_run_at}.` };
  }

  await env.DB.prepare("UPDATE autoblog_runs SET status = 'failed', message = 'Run timed out before completion.', completed_at = datetime('now') WHERE status = 'running' AND started_at <= datetime('now', '-20 minutes')").run();
  const activeRun = await env.DB.prepare("SELECT id FROM autoblog_runs WHERE status = 'running' AND started_at > datetime('now', '-20 minutes') LIMIT 1").first();
  if (activeRun) return { status: "skipped", message: "Another autoblog run is already active." };
  const monthCount = await env.DB.prepare("SELECT COUNT(*) AS total FROM blog_posts WHERE ai_generated = 1 AND created_at >= date('now', 'start of month')").first<{ total: number }>();
  if (Number(monthCount?.total || 0) >= settings.max_posts_per_month) return { status: "skipped", message: "The monthly AI article limit has been reached." };

  const runId = crypto.randomUUID();
  await env.DB.prepare("INSERT INTO autoblog_runs (id, status, trigger_type, model) VALUES (?, 'running', ?, ?)").bind(runId, trigger, settings.model).run();
  try {
    const topics = parseTopics(settings.topics);
    const topic = topics[Number(monthCount?.total || 0) % topics.length];
    const search = await searchTrends(env.SERPAPI_API_KEY, topic, settings);
    const query = search.related_searches?.find(item => item.query)?.query || topic;
    const sources = [...(search.news_results || []), ...(search.organic_results || [])]
      .filter(item => item.title && item.link && isHttpUrl(item.link)).slice(0, 8);
    if (sources.length < 3) throw new Error("SerpApi returned too few credible source results for a useful article.");
    await env.DB.prepare("UPDATE autoblog_runs SET query = ? WHERE id = ?").bind(query, runId).run();

    const generated = await generateArticle(env.OPENROUTER_API_KEY, settings, query, sources);
    const title = cleanText(generated.title, 110);
    const excerpt = cleanText(generated.excerpt, 280);
    const seoTitle = cleanText(generated.seoTitle || title, 70);
    const metaDescription = cleanText(generated.metaDescription || excerpt, 165);
    const focusKeyword = cleanText(generated.focusKeyword || query, 100);
    let body = sanitizeArticleHtml(String(generated.bodyHtml || ""));
    if (!title || !excerpt || !body) throw new Error("OpenRouter returned an incomplete article.");
    const wordCount = stripHtml(body).split(/\s+/).filter(Boolean).length;
    if (wordCount < settings.min_words) throw new Error(`The generated article was ${wordCount} words; the configured minimum is ${settings.min_words}.`);
    body += sourceSection(sources);

    const existing = (await env.DB.prepare("SELECT id, slug, title, excerpt, body, content_fingerprint FROM blog_posts ORDER BY created_at DESC LIMIT 100").all()).results as Array<Record<string, unknown>>;
    const comparisonText = `${title} ${excerpt} ${stripHtml(body)}`;
    const fingerprint = await sha256(normalize(comparisonText));
    const similarity = existing.reduce((highest, post) => Math.max(highest, articleSimilarity(
      { title, text: comparisonText },
      { title: String(post.title || ""), text: `${post.title || ""} ${post.excerpt || ""} ${stripHtml(String(post.body || ""))}` },
    )), 0);
    if (existing.some(post => post.content_fingerprint === fingerprint) || similarity >= settings.similarity_threshold) {
      const message = `Rejected as too similar to existing content (${Math.round(similarity * 100)}% similarity).`;
      await finishRun(env.DB, runId, "skipped", message, similarity);
      await scheduleNext(env.DB, settings.interval_hours);
      return { status: "skipped", message, similarity };
    }

    const baseSlug = slugify(title);
    if (!baseSlug) throw new Error("The generated title could not form a valid URL.");
    const collision = existing.some(post => post.slug === baseSlug);
    const slug = collision ? `${baseSlug}-${new Date().toISOString().slice(0, 10)}` : baseSlug;
    const articleId = crypto.randomUUID();
    const publishedAt = settings.publish_mode === "published" ? new Date().toISOString() : null;
    await env.DB.prepare(`INSERT INTO blog_posts
      (id, slug, title, excerpt, body, status, published_at, seo_title, meta_description, focus_keyword, source_urls, ai_generated, ai_model, content_fingerprint, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, datetime('now'))`)
      .bind(articleId, slug, title, excerpt, body, settings.publish_mode, publishedAt, seoTitle, metaDescription, focusKeyword,
        JSON.stringify(sources.map(source => source.link)), settings.model, fingerprint).run();
    await env.DB.prepare("UPDATE autoblog_runs SET status = 'created', article_id = ?, similarity_score = ?, message = ?, completed_at = datetime('now') WHERE id = ?")
      .bind(articleId, similarity, `${wordCount} words created as ${settings.publish_mode}.`, runId).run();
    await scheduleNext(env.DB, settings.interval_hours);
    return { status: "created", articleId, slug, title, publishMode: settings.publish_mode, similarity, wordCount };
  } catch (error) {
    const message = error instanceof Error ? error.message : "The autoblog run failed.";
    await finishRun(env.DB, runId, "failed", message);
    await env.DB.prepare("UPDATE autoblog_settings SET last_run_at = datetime('now'), next_run_at = datetime('now', '+6 hours') WHERE id = 'primary'").run();
    throw error;
  }
}

async function searchTrends(apiKey: string, topic: string, settings: AutoblogSettings) {
  const url = new URL("https://serpapi.com/search");
  url.search = new URLSearchParams({
    engine: "google", q: `${topic} UK`, gl: settings.search_country, hl: settings.search_language,
    tbs: "qdr:m", num: "10", output: "json", api_key: apiKey,
  }).toString();
  const response = await fetch(url);
  const result = await response.json<SerpPayload & { error?: string }>();
  if (!response.ok || result.error) throw new Error(result.error || `SerpApi failed (${response.status}).`);
  return result;
}

async function generateArticle(apiKey: string, settings: AutoblogSettings, query: string, sources: SearchItem[]) {
  const sourceBrief = sources.map((source, index) => `${index + 1}. ${source.title}\nURL: ${source.link}\nSummary: ${source.snippet || "No summary supplied"}\nDate: ${source.date || "Unknown"}`).join("\n\n");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "HTTP-Referer": "https://buildwithduke.pages.dev", "X-Title": "Build With Duke Autoblog" },
    body: JSON.stringify({
      model: settings.model, temperature: 0.35, max_tokens: 5000,
      messages: [
        { role: "system", content: `You are the editorial assistant for Build With Duke, a UK-focused full-stack web development and AI automation consultancy. Write original, practical UK English for founders and small-business operators. Never copy source phrasing, invent facts, pad for keywords, claim first-hand testing that did not happen, or mention being an AI. Use only the supplied source brief for time-sensitive claims. Return one valid JSON object and no markdown wrapper with keys: title, excerpt, seoTitle, metaDescription, focusKeyword, bodyHtml. bodyHtml may use only h2, h3, p, ul, ol, li, strong, em, blockquote, code, pre and a tags. Do not add a sources section; the application adds it. Target at least ${settings.min_words} words.` },
        { role: "user", content: `Create a genuinely useful article around this current search intent: ${query}\n\nAvoid overlap with generic definitions: lead with a clear point of view, concrete decision criteria, implementation cautions, and an actionable checklist.\n\nSOURCE BRIEF\n${sourceBrief}` },
      ],
    }),
  });
  const result = await response.json<{ choices?: Array<{ message?: { content?: string } }>; error?: { message?: string } }>();
  if (!response.ok) throw new Error(result.error?.message || `OpenRouter failed (${response.status}).`);
  const content = result.choices?.[0]?.message?.content || "";
  const objectText = content.match(/\{[\s\S]*\}/)?.[0];
  if (!objectText) throw new Error("OpenRouter did not return the requested article JSON.");
  try { return JSON.parse(objectText) as GeneratedArticle; } catch { throw new Error("OpenRouter returned malformed article JSON."); }
}

function sourceSection(sources: SearchItem[]) {
  const items = sources.map(source => `<li><a href="${escapeHtml(source.link!)}">${escapeHtml(source.title!)}</a>${source.source ? ` — ${escapeHtml(source.source)}` : ""}</li>`).join("");
  return `<h2>Sources and further reading</h2><p>These sources informed the current context; the analysis and recommendations above are original.</p><ul>${items}</ul>`;
}

function articleSimilarity(left: { title: string; text: string }, right: { title: string; text: string }) {
  const titleScore = jaccard(words(left.title), words(right.title));
  const contentScore = jaccard(shingles(left.text), shingles(right.text));
  return Math.max(titleScore, contentScore);
}

function words(value: string) { return new Set(normalize(value).split(" ").filter(word => word.length > 2 && !stopWords.has(word))); }
function shingles(value: string) {
  const tokens = normalize(value).split(" ").filter(word => word.length > 2 && !stopWords.has(word));
  const result = new Set<string>();
  for (let index = 0; index < tokens.length - 2; index += 1) result.add(tokens.slice(index, index + 3).join(" "));
  return result;
}
function jaccard(left: Set<string>, right: Set<string>) {
  if (!left.size || !right.size) return 0;
  let intersection = 0; for (const value of left) if (right.has(value)) intersection += 1;
  return intersection / (left.size + right.size - intersection);
}
function normalize(value: string) { return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim(); }
function cleanText(value: unknown, max: number) { return String(value || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, max); }
function slugify(value: string) { return value.toLowerCase().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100).replace(/-$/, ""); }
function parseTopics(value: string) {
  try { const result = JSON.parse(value); if (Array.isArray(result) && result.some(Boolean)) return result.map(String).map(item => item.trim()).filter(Boolean).slice(0, 20); } catch { /* validation below */ }
  throw new Error("Add at least one valid autoblog topic.");
}
function isHttpUrl(value: string) { try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; } }
async function sha256(value: string) { return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))), byte => byte.toString(16).padStart(2, "0")).join(""); }
async function finishRun(db: D1Database, id: string, status: "skipped" | "failed", message: string, similarity?: number) {
  await db.prepare("UPDATE autoblog_runs SET status = ?, message = ?, similarity_score = ?, completed_at = datetime('now') WHERE id = ?").bind(status, message.slice(0, 1000), similarity ?? null, id).run();
}
async function scheduleNext(db: D1Database, intervalHours: number) {
  await db.prepare("UPDATE autoblog_settings SET last_run_at = datetime('now'), next_run_at = datetime('now', ?), updated_at = datetime('now') WHERE id = 'primary'").bind(`+${intervalHours} hours`).run();
}

const stopWords = new Set("the a an and or but if then with without for from into onto of to in on at by is are was were be been being this that these those it its as your you our we they their can could should would may might will uk how what why when where".split(" "));
