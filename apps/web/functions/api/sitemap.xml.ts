interface Env { DB?: D1Database }
const base = "https://buildwithduke.pages.dev";
const staticRoutes = ["/", "/projects", "/projects/eventstreamhd", "/projects/files-combiner", "/projects/fraser-james", "/projects/koha-isbd", "/projects/sora-studio", "/projects/n8n-workflows", "/projects/the-grills-corner", "/projects/home-away-travels", "/services", "/pricing", "/about", "/contact", "/cv", "/blog", "/privacy", "/cookies", "/terms"];

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const dynamic = env.DB ? await Promise.all([
    env.DB.prepare("SELECT slug, created_at AS updated_at FROM projects ORDER BY created_at DESC").all().catch(() => ({ results: [] })),
    env.DB.prepare("SELECT slug, COALESCE(published_at, created_at) AS updated_at FROM blog_posts WHERE status = 'published' AND (published_at IS NULL OR published_at <= datetime('now')) ORDER BY published_at DESC").all().catch(() => ({ results: [] })),
  ]) : [{ results: [] }, { results: [] }];
  const entries = new Map<string, string | undefined>(staticRoutes.map(route => [route, undefined]));
  for (const row of dynamic[0].results as Array<Record<string, unknown>>) entries.set(`/projects/${row.slug}`, dateOnly(row.updated_at));
  for (const row of dynamic[1].results as Array<Record<string, unknown>>) entries.set(`/blog/${row.slug}`, dateOnly(row.updated_at));
  const urls = [...entries].map(([route, updated]) => `<url><loc>${base}${route}</loc>${updated ? `<lastmod>${updated}</lastmod>` : ""}${route === "/" ? "<priority>1.0</priority>" : route === "/projects" || route === "/contact" || route === "/blog" ? "<priority>0.9</priority>" : ""}</url>`).join("");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=1800" } });
};
function dateOnly(value: unknown) { const date = new Date(String(value || "")); return Number.isNaN(date.getTime()) ? undefined : date.toISOString().slice(0, 10); }
