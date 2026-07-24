import { ensureManagedDefaults } from "../_shared/managed-defaults";

interface Env { DB?: D1Database }

async function rows(db: D1Database, query: string) {
  return (await db.prepare(query).all()).results;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return Response.json({});
  try {
    await ensureManagedDefaults(env.DB);
    const [projects, pricing, testimonials, blogPosts, settings, pages] = await Promise.all([
      rows(env.DB, "SELECT * FROM projects ORDER BY sort_order ASC, created_at DESC"),
      rows(env.DB, "SELECT * FROM pricing_tiers ORDER BY sort_order ASC"),
      rows(env.DB, "SELECT * FROM testimonials ORDER BY sort_order ASC"),
      rows(env.DB, "SELECT id, slug, title, excerpt, body, published_at, seo_title, meta_description, cover_image, focus_keyword, source_urls, ai_generated FROM blog_posts WHERE status = 'published' AND (published_at IS NULL OR datetime(published_at) <= datetime('now')) ORDER BY datetime(published_at) DESC, created_at DESC"),
      rows(env.DB, "SELECT key, value FROM business_settings WHERE key IN ('business_name','contact_email','phone_number','phone_display','whatsapp_number','service_area','response_time','github_url','instagram_url','linkedin_url','accepting_projects','visitor_guide_enabled','industry','business_hours','payment_methods') ORDER BY key ASC"),
      rows(env.DB, "SELECT slug, name, seo_title, meta_description, content FROM page_content ORDER BY sort_order ASC").catch(() => []),
    ]);
    return Response.json({ projects, pricing, testimonials, blogPosts, settings, pages }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
  } catch {
    return Response.json({});
  }
};
