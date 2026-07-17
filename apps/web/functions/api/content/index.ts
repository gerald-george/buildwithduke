interface Env { DB?: D1Database }

async function rows(db: D1Database, query: string) {
  return (await db.prepare(query).all()).results;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return Response.json({});
  try {
    const [projects, pricing, testimonials, blogPosts] = await Promise.all([
      rows(env.DB, "SELECT * FROM projects ORDER BY featured DESC, sort_order ASC, created_at DESC"),
      rows(env.DB, "SELECT * FROM pricing_tiers ORDER BY sort_order ASC"),
      rows(env.DB, "SELECT * FROM testimonials ORDER BY sort_order ASC"),
      rows(env.DB, "SELECT id, slug, title, excerpt, body, published_at FROM blog_posts WHERE status = 'published' ORDER BY published_at DESC"),
    ]);
    return Response.json({ projects, pricing, testimonials, blogPosts }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
  } catch {
    return Response.json({});
  }
};
