import { projects as fallbackProjects } from "../src/data";

interface Env { DB?: D1Database }

const siteUrl = "https://buildwithduke.pages.dev";
const staticMeta: Record<string, [string, string]> = {
  "/": ["Build With Duke — Full-stack developer & AI automation specialist", "Full-stack web products and practical AI automations for UK founders and small businesses."],
  "/projects": ["Web development and automation projects — Build With Duke", "Explore live web products, software and AI automation projects built by Duke Chijimaka Jonathan."],
  "/services": ["Full-stack web development and AI automation services — Build With Duke", "React, Cloudflare, n8n and AI automation services for UK businesses that need useful, maintainable systems."],
  "/pricing": ["Website and automation pricing — Build With Duke", "Clear GBP starting packages for websites, web applications, admin systems and business automation."],
  "/about": ["About Duke Chijimaka Jonathan — Full-stack developer", "Meet Duke, a full-stack developer, AI automation specialist and First-Class information-systems graduate working remotely UK-wide."],
  "/contact": ["Start a web or automation project — Build With Duke", "Tell Duke what you need to build, fix or automate. Remote project enquiries are welcome from across the UK."],
  "/cv": ["Duke Chijimaka Jonathan CV — Full-stack and AI automation", "Experience, technical stack, education and selected outcomes from Duke Chijimaka Jonathan."],
  "/blog": ["Web development and AI automation insights — Build With Duke", "Practical articles about web systems, AI-assisted development, n8n and business automation."],
  "/privacy": ["Privacy policy — Build With Duke", "How Build With Duke handles enquiry and website data."],
  "/cookies": ["Cookie policy — Build With Duke", "Necessary storage and optional consent choices on Build With Duke."],
  "/terms": ["Website terms — Build With Duke", "Terms for using the Build With Duke portfolio website."],
};

export const onRequest: PagesFunction<Env> = async context => {
  const url = new URL(context.request.url);
  const routePath = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
  const acceptsHtml = context.request.method === "GET" && (context.request.headers.get("Accept") || "").includes("text/html");
  if (!acceptsHtml || url.pathname.startsWith("/api/") || /\.[a-z0-9]+$/i.test(url.pathname)) return context.next();
  const response = await context.next();
  if (!(response.headers.get("Content-Type") || "").includes("text/html")) return response;

  let title = staticMeta[routePath]?.[0];
  let description = staticMeta[routePath]?.[1];
  let schema: Record<string, unknown> | null = null;
  let indexable = routePath !== "/admin";
  let notFound = false;
  if (routePath.startsWith("/projects/")) {
    const slug = routePath.split("/").filter(Boolean).pop() || "";
    const storedProject = context.env.DB ? await context.env.DB.prepare("SELECT slug, title, description, stack, image FROM projects WHERE slug = ?").bind(slug).first<Record<string, unknown>>().catch(() => null) : null;
    const project = storedProject || fallbackProjects.find(item => item.slug === slug) as unknown as Record<string, unknown> | undefined;
    if (project) {
      title = `${project.title} case study — Build With Duke`; description = String(project.description || "");
      schema = { "@context": "https://schema.org", "@type": "CreativeWork", name: project.title, description, url: `${siteUrl}${routePath}`, image: absoluteUrl(String(project.image || "/logo.svg")), author: { "@id": `${siteUrl}/#duke` }, keywords: (Array.isArray(project.stack) ? project.stack.map(String) : parseJson(project.stack)).join(", ") };
    } else { indexable = false; notFound = true; }
  } else if (routePath.startsWith("/blog/")) {
    const slug = routePath.split("/").filter(Boolean).pop() || "";
    const post = context.env.DB ? await context.env.DB.prepare("SELECT slug, title, excerpt, seo_title, meta_description, focus_keyword, published_at FROM blog_posts WHERE slug = ? AND status = 'published' AND (published_at IS NULL OR published_at <= datetime('now'))").bind(slug).first<Record<string, unknown>>().catch(() => null) : null;
    if (post) {
      title = String(post.seo_title || `${post.title} — Build With Duke`); description = String(post.meta_description || post.excerpt || "");
      schema = { "@context": "https://schema.org", "@type": "BlogPosting", headline: post.title, description, datePublished: post.published_at, mainEntityOfPage: `${siteUrl}${routePath}`, url: `${siteUrl}${routePath}`, image: `${siteUrl}/logo.png`, author: { "@id": `${siteUrl}/#duke` }, publisher: { "@id": `${siteUrl}/#business` }, keywords: post.focus_keyword || undefined, inLanguage: "en-GB" };
    } else { indexable = false; notFound = true; }
  } else if (!staticMeta[routePath] && routePath !== "/admin") { indexable = false; notFound = true; }

  const canonical = `${siteUrl}${routePath}`;
  let html = await response.text();
  if (title && description) {
    html = replaceTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${escapeText(title)}</title>`);
    html = replaceMeta(html, "name", "description", description);
    html = replaceMeta(html, "property", "og:title", title);
    html = replaceMeta(html, "property", "og:description", description);
    html = replaceMeta(html, "property", "og:url", canonical);
    html = replaceMeta(html, "property", "og:type", routePath.startsWith("/blog/") ? "article" : "website");
    html = replaceMeta(html, "name", "twitter:title", title);
    html = replaceMeta(html, "name", "twitter:description", description);
    html = html.replace(/<link rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escapeAttribute(canonical)}" />`);
  }
  html = replaceMeta(html, "name", "robots", indexable ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" : "noindex, nofollow");
  if (schema) html = html.replace("</head>", `<script id="route-schema" type="application/ld+json">${safeJson(schema)}</script></head>`);
  const headers = new Headers(response.headers); headers.set("Vary", "Accept"); headers.set("X-Robots-Tag", indexable ? "index, follow" : "noindex, nofollow");
  return new Response(html, { status: notFound ? 404 : response.status, statusText: notFound ? "Not Found" : response.statusText, headers });
};

function replaceMeta(html: string, attribute: "name" | "property", key: string, value: string) {
  const pattern = new RegExp(`<meta\\s+${attribute}=["']${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`, "i");
  return replaceTag(html, pattern, `<meta ${attribute}="${key}" content="${escapeAttribute(value)}" />`);
}
function replaceTag(html: string, pattern: RegExp, replacement: string) { return pattern.test(html) ? html.replace(pattern, replacement) : html.replace("</head>", `${replacement}</head>`); }
function escapeText(value: string) { return value.replace(/[&<>]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[character]!); }
function escapeAttribute(value: string) { return value.replace(/[&"<>]/g, character => ({ "&": "&amp;", '"': "&quot;", "<": "&lt;", ">": "&gt;" })[character]!); }
function safeJson(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
function absoluteUrl(value: string) { try { return new URL(value, siteUrl).toString(); } catch { return `${siteUrl}/logo.svg`; } }
function parseJson(value: unknown) { try { const parsed = JSON.parse(String(value || "[]")); return Array.isArray(parsed) ? parsed.map(String) : []; } catch { return []; } }
