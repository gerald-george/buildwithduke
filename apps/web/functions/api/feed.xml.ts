interface Env { DB?: D1Database }
const base = "https://buildwithduke.pages.dev";

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const posts = env.DB ? (await env.DB.prepare("SELECT slug, title, excerpt, COALESCE(published_at, created_at) AS published_at FROM blog_posts WHERE status = 'published' AND (published_at IS NULL OR published_at <= datetime('now')) ORDER BY published_at DESC LIMIT 30").all().catch(() => ({ results: [] }))).results : [];
  const items = (posts as Array<Record<string, unknown>>).map(post => `<item><title>${xml(String(post.title))}</title><link>${base}/blog/${xml(String(post.slug))}</link><guid isPermaLink="true">${base}/blog/${xml(String(post.slug))}</guid><description>${xml(String(post.excerpt || ""))}</description><pubDate>${new Date(String(post.published_at)).toUTCString()}</pubDate></item>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Build With Duke — Build log</title><link>${base}/blog</link><description>Practical notes on web systems, AI-assisted development and automation.</description><language>en-gb</language>${items}</channel></rss>`, { headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=1800" } });
};
function xml(value: string) { return value.replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]!); }
