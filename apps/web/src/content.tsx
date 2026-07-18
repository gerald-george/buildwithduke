import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { Project, pricing as fallbackPricing, projects as fallbackProjects } from "./data";

export type PricingTier = (typeof fallbackPricing)[number];
export type Testimonial = { id: string; authorName: string; authorRole?: string; company?: string; quote: string };
export type BlogPost = { id: string; slug: string; title: string; excerpt: string; body?: string; publishedAt?: string };

type ContentValue = {
  projects: Project[];
  pricing: PricingTier[];
  testimonials: Testimonial[];
  blogPosts: BlogPost[];
  loading: boolean;
};

const ContentContext = createContext<ContentValue>({ projects: fallbackProjects, pricing: fallbackPricing, testimonials: [], blogPosts: [], loading: false });

type ApiPayload = {
  projects?: Array<Record<string, unknown>>;
  pricing?: Array<Record<string, unknown>>;
  testimonials?: Array<Record<string, unknown>>;
  blogPosts?: Array<Record<string, unknown>>;
};

const json = <T,>(value: unknown, fallback: T): T => {
  if (typeof value !== "string") return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
};

const mockupLanguage = (value: unknown) => String(value)
  .replace(/\bDemo\b/g, "Mockup")
  .replace(/\bdemo\b/g, "mockup");

const excludedProjectSlugs = new Set(["bemdproperties", "unconventional-soccer-prompt", "unconventional-soccer-merch"]);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [remote, setRemote] = useState<ApiPayload>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/content", { signal: controller.signal })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((payload: ApiPayload) => setRemote(payload))
      .catch(() => undefined)
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const value = useMemo<ContentValue>(() => {
    const remoteProjects = (remote.projects || []).map(row => ({
      slug: String(row.slug), title: String(row.title), eyebrow: mockupLanguage(row.eyebrow || row.category),
      description: mockupLanguage(row.description), problem: mockupLanguage(row.problem || ""), solution: mockupLanguage(row.solution || ""), result: mockupLanguage(row.result || ""),
      stack: json<string[]>(row.stack, []), category: String(row.category) as Project["category"],
      image: String(row.image || json<string[]>(row.screenshot_r2_keys, ["/logo.svg"])[0] || "/logo.svg"),
      liveUrl: String(row.live_url || "#"), featured: Boolean(row.featured), demo: Boolean(row.demo_flag),
    })).filter(project => !excludedProjectSlugs.has(project.slug));
    const remoteBySlug = new Map(remoteProjects.map(project => [project.slug, project]));
    const projects = [
      ...fallbackProjects.filter(project => !excludedProjectSlugs.has(project.slug)).map(project => remoteBySlug.get(project.slug) || project),
      ...remoteProjects.filter(project => !fallbackProjects.some(fallback => fallback.slug === project.slug)),
    ];
    const pricing = remote.pricing?.length ? remote.pricing.map(row => ({
      name: String(row.name), price: row.price_gbp == null ? "Let’s scope it" : `£${Number(row.price_gbp).toLocaleString("en-GB")}`,
      note: String(row.description), features: json<string[]>(row.features, []), popular: Boolean(row.is_popular),
    })) : fallbackPricing;
    const testimonials = (remote.testimonials || []).map(row => ({ id: String(row.id), authorName: String(row.author_name), authorRole: String(row.author_role || ""), company: String(row.company || ""), quote: String(row.quote) }));
    const blogPosts = (remote.blogPosts || []).map(row => ({ id: String(row.id), slug: String(row.slug), title: String(row.title), excerpt: String(row.excerpt || ""), body: String(row.body || ""), publishedAt: String(row.published_at || "") }));
    return { projects, pricing, testimonials, blogPosts, loading };
  }, [remote, loading]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() { return useContext(ContentContext); }
