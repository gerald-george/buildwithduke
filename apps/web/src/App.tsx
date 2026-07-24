import { FormEvent, lazy, ReactNode, Suspense, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight, Award, BookOpen, Bot, Check, CheckCircle2, CircleDot, Clock3, Code2, Download, ExternalLink, Github, Globe2, GraduationCap, Mail, MapPin, MessageCircle, Send, ShieldCheck, Workflow, Wrench } from "lucide-react";
import { FAQ, IconBox, Layout, ProjectVisual, SectionHead, TechTicker, TerminalWindow, WhatsAppLink } from "./components";
import { ContentProvider, Testimonial, useContent } from "./content";
import { RevealHeading, RotatingTypingText, ScrollTypingText } from "./motion";
import { PageContent } from "./pageContent";
import { SITE_URL } from "./site";
import DOMPurify from "dompurify";

const Admin = lazy(() => import("./Admin"));

const meta: Record<string, [string, string]> = {
  "/": ["buildwithduke — Full-stack developer & AI automation specialist", "I build fast web products and useful AI automations for UK founders and small businesses."],
  "/projects": ["Projects — buildwithduke", "Live web products, software and automation projects built by Duke."],
  "/services": ["Services — buildwithduke", "Full-stack web development, AI automation and n8n workflows for UK businesses."],
  "/pricing": ["Pricing — buildwithduke", "Clear GBP packages for websites, web applications and automation."],
  "/about": ["About Duke — buildwithduke", "Full-stack developer, AI automation specialist and systems thinker."],
  "/contact": ["Start a project — buildwithduke", "Tell Duke what you need to build, fix or automate."],
  "/cv": ["Duke’s CV — buildwithduke", "Duke Chijimaka Jonathan’s experience, technical stack, education and selected outcomes."],
  "/articles": ["Articles — buildwithduke", "Practical notes on web systems, AI-assisted development and automation."],
  "/privacy": ["Privacy policy — buildwithduke", "How buildwithduke handles enquiry and website data."],
  "/cookies": ["Cookie policy — buildwithduke", "Necessary storage and optional consent choices on buildwithduke."],
  "/terms": ["Website terms — buildwithduke", "Terms for using the buildwithduke portfolio website."],
};

function PageMeta() {
  const { pathname } = useLocation();
  const { projects, blogPosts, pages } = useContent();
  useEffect(() => {
    const key = pathname.startsWith("/projects/") ? "/projects" : pathname.startsWith("/articles/") ? "/articles" : pathname;
    const project = pathname.startsWith("/projects/") ? projects.find(item => item.slug === pathname.split("/").pop()) : undefined;
    const article = pathname.startsWith("/articles/") ? blogPosts.find(item => item.slug === pathname.split("/").pop()) : undefined;
    const pageSlug = key === "/" ? "home" : key === "/articles" ? "blog" : key.slice(1);
    const managedPage = pages[pageSlug];
    const pricingFaq = pageList(pages.pricing?.content || {}, "faq_questions").map((question, index) => [question, pageList(pages.pricing?.content || {}, "faq_answers")[index] || ""]);
    const value = project ? [`${project.title} case study — buildwithduke`, project.description] : article ? [article.seoTitle || `${article.title} — buildwithduke`, article.metaDescription || article.excerpt] : managedPage ? [managedPage.seoTitle, managedPage.metaDescription] : meta[key] || ["buildwithduke", "Full-stack products and useful automation."];
    document.title = value[0];
    document.querySelector('meta[name="description"]')?.setAttribute("content", value[1]);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", value[0]);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", value[1]);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", `${SITE_URL}${pathname}`);
    document.querySelector('meta[property="og:type"]')?.setAttribute("content", article ? "article" : "website");
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", value[0]);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", value[1]);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", `${SITE_URL}${pathname}`);
    const oldSchema = document.getElementById("route-schema"); oldSchema?.remove();
    const schema = project ? { "@context": "https://schema.org", "@type": "CreativeWork", name: project.title, description: project.description, url: `${SITE_URL}/projects/${project.slug}`, image: `${SITE_URL}${project.image}`, author: { "@type": "Person", name: "Duke Chijimaka Jonathan", url: `${SITE_URL}/about` }, keywords: project.stack.join(", ") } : article ? { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.title, description: article.excerpt, datePublished: article.publishedAt, url: `${SITE_URL}/articles/${article.slug}`, author: { "@type": "Person", name: "Duke Chijimaka Jonathan", url: `${SITE_URL}/about` } } : pathname === "/pricing" || pathname === "/" ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: pricingFaq.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) } : null;
    if (schema) { const script = document.createElement("script"); script.id = "route-schema"; script.type = "application/ld+json"; script.text = JSON.stringify(schema); document.head.appendChild(script); }
  }, [pathname, projects, blogPosts, pages]);
  return null;
}

export default function App() {
  return <ContentProvider><Layout><PageMeta /><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/projects/:slug" element={<ProjectDetail />} />
    <Route path="/services" element={<Services />} />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/cv" element={<ManagedCV />} />
    <Route path="/articles/:slug" element={<BlogDetail />} />
    <Route path="/articles" element={<Blog />} />
    <Route path="/blog/:slug" element={<LegacyArticleRedirect />} />
    <Route path="/blog" element={<Navigate to="/articles" replace />} />
    <Route path="/privacy" element={<Legal type="privacy" />} />
    <Route path="/cookies" element={<Legal type="cookies" />} />
    <Route path="/terms" element={<Legal type="terms" />} />
    <Route path="/admin" element={<Suspense fallback={<section className="admin-page"><span className="kicker">Loading secure workspace…</span></section>}><Admin /></Suspense>} />
    <Route path="*" element={<NotFound />} />
  </Routes></Layout></ContentProvider>;
}

function Home() {
  const { projects, pricing, testimonials, blogPosts, settings, page } = useContent();
  const copy = page("home");
  const pricingCopy = page("pricing");
  const homeFaq = zip2(pageList(pricingCopy, "faq_questions"), pageList(pricingCopy, "faq_answers"));
  const proof = zip3(pageList(copy, "proof_values"), pageList(copy, "proof_labels"), pageList(copy, "proof_copies"));
  const process = zip3(pageList(copy, "process_titles"), pageList(copy, "process_copies"), pageList(copy, "process_logs"));
  return <>
    <section className="hero">
      <div className="hero-grid" aria-hidden="true" />
      <div className="shell hero-inner">
        <div className="hero-copy">
          <div className="availability"><i /> {pageText(copy, "hero_availability")}</div>
          <h1><span>I build </span><RotatingTypingText texts={pageList(copy, "hero_rotating_lines")} /></h1>
          <p>{pageText(copy, "hero_intro")}</p>
          <div className="button-row"><Link className="button button-primary" to="/contact">Start a project <ArrowRight size={17} /></Link><Link className="button button-ghost" to="/projects">View live work <ArrowDown size={17} /></Link></div>
          <div className="hero-meta"><span><MapPin size={15} /> {settings.service_area}</span><span><Clock3 size={15} /> Replies {settings.response_time}</span></div>
        </div>
        <div className="hero-system" aria-label="Current system status">
          <div className="system-head"><span>duke@buildwithduke:~</span><CircleDot size={16} /></div>
          <div className="system-console">
            <div className="system-command"><span>$</span><code>duke --status --plain</code></div>
            <div className="system-output"><div><span>focus</span><strong>{pageText(copy, "system_focus")}</strong></div><div><span>method</span><strong>{pageText(copy, "system_method")}</strong></div><div><span>signal</span><strong>{pageText(copy, "system_signal")}</strong></div></div>
            <div className="system-ready"><i /> {pageText(copy, "system_ready")}<span aria-hidden="true">_</span></div>
          </div>
          <div className="system-stats"><div><strong>{pageText(copy, "system_repo_count")}</strong><span>public repos</span></div><div><strong>{pageText(copy, "system_integrity")}</strong><span>data integrity</span></div><div><strong>{pageText(copy, "system_education")}</strong><span>class honours</span></div></div>
        </div>
      </div>
      <TechTicker />
    </section>

    <section className="section shell" id="work"><SectionHead label="01 / Selected work" title={pageText(copy, "work_heading")} copy={pageText(copy, "work_intro")} />
      <div className="featured-grid">{projects.filter(p => p.featured).map(project => <TerminalWindow key={project.slug} label={`~/projects/${project.slug}`} className="project-card">
        <ProjectVisual image={project.image} title={project.title} /><div className="project-card-body"><div className="project-eyebrow">{project.eyebrow}</div><h3>{project.title}</h3><p>{project.description}</p><div className="tag-row">{project.stack.slice(0, 3).map(t => <span key={t}>{t}</span>)}</div>{project.demo && <div className="demo-note"><CircleDot size={13} /> {project.demoNote || "Mockup build · live client agreement in place"}</div>}<div className="card-actions"><Link to={`/projects/${project.slug}`}>Case study <ArrowRight size={15} /></Link><a href={project.liveUrl} target="_blank" rel="noreferrer">Visit <ArrowUpRight size={15} /></a></div></div>
      </TerminalWindow>)}</div>
      <div className="section-end"><Link className="text-link" to="/projects">Explore every project <ArrowRight size={16} /></Link></div>
    </section>

    <section className="proof-band"><div className="shell proof-grid"><div className="whoami"><span className="prompt">$ whoami</span><blockquote>“{pageText(copy, "proof_quote")}”</blockquote><span className="cursor-line">duke@buildwithduke <i /></span></div><div className="proof-list">
      {proof.map(([num, label, detail]) => <div key={`${num}-${label}`}><strong>{num}</strong><span>{label}</span><p>{detail}</p></div>)}
    </div></div></section>

    <section className="section shell"><SectionHead label="02 / The process" title={pageText(copy, "process_heading")} copy={pageText(copy, "process_intro")} /><div className="process-grid">{process.map(([title, detail, log], index) => <div key={`${title}-${index}`} className="process-step"><span>{String(index + 1).padStart(2, "0")}</span><h3>{title}</h3><p>{detail}</p><code>{log}</code></div>)}</div></section>

    <section className="section section-lined"><div className="shell"><SectionHead label="03 / Pricing preview" title={pageText(copy, "pricing_heading")} copy={pageText(copy, "pricing_intro")} /><div className="pricing-preview">{[pricing[0], pricing[2], pricing[3]].filter(Boolean).map(t => <PriceCard key={t.name} tier={t} />)}</div><div className="section-end"><Link className="text-link" to="/pricing">Compare all five packages <ArrowRight size={16} /></Link></div></div></section>

    {blogPosts.length > 0 && <section className="section shell"><SectionHead label="04 / Articles" title={pageText(copy, "articles_heading")} copy={pageText(copy, "articles_intro")} /><div className="blog-grid">{blogPosts.slice(0, 3).map((post, index) => <article key={post.id}>{post.coverImage && <img className="blog-card-image" src={post.coverImage} alt="" loading="lazy" />}<span className="kicker">Article · {String(index + 1).padStart(2, "0")}</span><RevealHeading text={post.title} variant="decrypt" /><p>{post.excerpt}</p><Link className="blog-read-link" to={`/articles/${post.slug}`}>Read article <ArrowRight size={15} /></Link></article>)}</div><div className="section-end"><Link className="text-link" to="/articles">Browse every article <ArrowRight size={16} /></Link></div></section>}

    {testimonials.length > 0 && <Testimonials items={testimonials} />}

    <section className="section shell faq-section"><SectionHead label="05 / Before you ask" title={pageText(copy, "faq_heading")} /><FAQ items={homeFaq.slice(0, 4)} /></section>
    <CTA />
  </>;
}

function Testimonials({ items }: { items: Testimonial[] }) {
  const [active, setActive] = useState(0);
  const item = items[active];
  const copy = useContent().page("home");
  return <section className="section shell testimonial-section" aria-label="Client feedback"><SectionHead label="Client signal" title={pageText(copy, "testimonials_heading")} /><TerminalWindow label="testimonials/latest" className="testimonial-terminal"><blockquote>“<ScrollTypingText key={`${item.id}-${active}`} text={item.quote} />”</blockquote><div className="testimonial-meta"><span><strong>{item.authorName}</strong>{[item.authorRole, item.company].filter(Boolean).join(" · ")}</span>{items.length > 1 && <div><button aria-label="Previous testimonial" onClick={() => setActive((active - 1 + items.length) % items.length)}>←</button><span>{active + 1} / {items.length}</span><button aria-label="Next testimonial" onClick={() => setActive((active + 1) % items.length)}>→</button></div>}</div></TerminalWindow></section>;
}

function PageHero({ label, title, copy, children }: { label: string; title: string; copy?: string; children?: ReactNode }) {
  return <section className="page-hero"><div className="shell"><span className="kicker">{label}</span><RevealHeading as="h1" text={title} variant="type" />{copy && <p>{copy}</p>}{children}</div></section>;
}

function Projects() {
  const { projects, page } = useContent();
  const copy = page("projects");
  const [filter, setFilter] = useState("All");
  const shown = useMemo(() => filter === "All" ? projects : projects.filter(p => p.category === filter), [filter, projects]);
  return <><PageHero label="/projects" title={pageText(copy, "hero_title")} copy={pageText(copy, "hero_intro")} />
    <section className="section shell"><div className="filter-bar" role="group" aria-label="Filter projects">{["All", "Web development", "AI automation", "Software"].map(item => <button aria-pressed={filter === item} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div>
      <div className="project-index">{shown.map(project => <TerminalWindow label={`~/projects/${project.slug}`} key={project.slug} className="project-index-card"><ProjectVisual image={project.image} title={project.title} /><div className="project-card-body"><div className="project-eyebrow">{project.eyebrow}</div><h2>{project.title}</h2><p>{project.description}</p><div className="tag-row">{project.stack.map(t => <span key={t}>{t}</span>)}</div>{project.demo && <div className="demo-note"><CircleDot size={13} /> {project.demoNote || "Mockup build · live client agreement in place"}</div>}<div className="card-actions"><Link to={`/projects/${project.slug}`}>Read case study <ArrowRight size={15} /></Link><a href={project.liveUrl} target="_blank" rel="noreferrer">Open live <ArrowUpRight size={15} /></a></div></div></TerminalWindow>)}</div>
    </section><CTA /></>;
}

function ProjectDetail() {
  const { projects, page } = useContent();
  const copy = page("projects");
  const { slug } = useParams(); const project = projects.find(p => p.slug === slug);
  if (!project) return <Navigate to="/projects" replace />;
  const related = projects.filter(p => p.slug !== project.slug && p.category === project.category).slice(0, 2);
  return <><section className="case-hero"><div className="shell"><Link className="back-link" to="/projects">← All projects</Link><div className="case-title"><div><span className="kicker">{project.eyebrow}</span><RevealHeading as="h1" text={project.title} variant="type" /><p>{project.description}</p><div className="button-row"><a className="button button-primary" href={project.liveUrl} target="_blank" rel="noreferrer">Visit project <ExternalLink size={17} /></a><Link className="button button-ghost" to="/contact">Build something useful</Link></div></div><TerminalWindow label={`${project.slug}.live`}><ProjectVisual image={project.image} title={project.title} /></TerminalWindow></div></div></section>
    <section className="section shell case-body"><aside><span>Project index</span><a href="#problem">01 Problem</a><a href="#build">02 Build</a><a href="#result">03 Result</a></aside><div className="case-copy"><section id="problem"><span className="kicker">01 / The problem</span><RevealHeading text={pageText(copy, "case_problem_heading")} variant="decrypt" /><p>{project.problem}</p></section><section id="build"><span className="kicker">02 / The build</span><RevealHeading text={pageText(copy, "case_build_heading")} variant="decrypt" /><p>{project.solution}</p><div className="stack-list">{project.stack.map(s => <span key={s}><Check size={14} />{s}</span>)}</div></section><section id="result"><span className="kicker">03 / The result</span><RevealHeading text={pageText(copy, "case_result_heading")} variant="decrypt" /><p>{project.result}</p>{project.resultMetrics && Object.keys(project.resultMetrics).length > 0 && <div className="project-metrics">{Object.entries(project.resultMetrics).map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>}{project.demo && <div className="callout"><ShieldCheck size={20} /><span><strong>Honest mockup label</strong>{project.demoNote || "This is a mockup build with a live client agreement in place. It is not presented as the client’s production storefront."}</span></div>}</section></div></section>
    {project.gallery?.length ? <section className="section section-lined"><div className="shell"><SectionHead label="A closer look" title="Project gallery." /><div className="project-gallery">{project.gallery.map((image, index) => <img key={image} src={image} alt={`${project.title} screenshot ${index + 1}`} loading="lazy" />)}</div></div></section> : null}
    {related.length > 0 && <section className="section section-lined"><div className="shell"><SectionHead label="Keep looking" title="Related work." /><div className="related-grid">{related.map(p => <Link to={`/projects/${p.slug}`} key={p.slug}><span>{p.eyebrow}</span><h3>{p.title}</h3><ArrowUpRight /></Link>)}</div></div></section>}<CTA /></>;
}

function Services() {
  const copy = useContent().page("services");
  const icons = [<Code2 />, <Bot />, <Workflow />, <Wrench />];
  const services = icons.map((icon, index) => ({ icon, name: pageText(copy, `service_${index + 1}_title`), copy: pageText(copy, `service_${index + 1}_copy`), list: pageList(copy, `service_${index + 1}_items`) }));
  return <><PageHero label="/services" title={pageText(copy, "hero_title")} copy={pageText(copy, "hero_intro")} /><section className="section shell"><div className="service-grid">{services.map((service, index) => <article key={service.name}><IconBox>{service.icon}</IconBox><span className="service-num">0{index + 1}</span><RevealHeading text={service.name} variant="type" className="service-title" /><p>{service.copy}</p><ul>{service.list.map(item => <li key={item}><Check size={15} />{item}</li>)}</ul><Link to="/contact">Discuss this service <ArrowRight size={15} /></Link></article>)}</div></section><section className="proof-band"><div className="shell service-callout"><div><span className="kicker">A useful first step</span><RevealHeading text={pageText(copy, "callout_heading")} variant="decrypt" /></div><p>{pageText(copy, "callout_copy")}</p></div></section><CTA /></>;
}

function PriceCard({ tier }: { tier: ReturnType<typeof useContent>["pricing"][number] }) { return <TerminalWindow label={`pricing/${tier.name.toLowerCase()}`} className={tier.popular ? "price-card popular" : "price-card"}>{tier.popular && <span className="popular-badge">Most popular</span>}<div className="price-body"><span className="price-name">{tier.name}</span><strong aria-label={`${tier.name} price ${tier.price}`}>{tier.price}</strong><p>{tier.note}</p><ul>{tier.features.map(f => <li key={f}><CheckCircle2 size={16} />{f}</li>)}</ul><Link className={tier.popular ? "button button-primary" : "button button-ghost"} to={`/contact?package=${tier.name.toLowerCase()}`}>Choose {tier.name} <ArrowRight size={16} /></Link></div></TerminalWindow> }
function Pricing() { const { pricing, page } = useContent(); const copy = page("pricing"); const questions = pageList(copy, "faq_questions"); const answers = pageList(copy, "faq_answers"); const managedFaq = questions.map((question, index) => [question, answers[index] || ""]); return <><PageHero label="/pricing" title={pageText(copy, "hero_title")} /><section className="section shell"><div className="pricing-full">{pricing.map(t => <PriceCard key={t.name} tier={t} />)}</div><div className="payment-note"><ShieldCheck /><div><strong>{pageText(copy, "payment_heading")}</strong><p>{pageText(copy, "payment_copy")}</p></div></div></section><section className="section section-lined"><div className="shell faq-section"><SectionHead label="Pricing FAQ" title={pageText(copy, "faq_heading")} /><FAQ items={managedFaq} /></div></section><CTA /></> }

function About() { const { settings, page } = useContent(); const copy = page("about"); const headshot = pageText(copy, "headshot_image") || "/headshot.png"; const titles = pageList(copy, "credential_titles"); const details = pageList(copy, "credential_details"); const icons = [<GraduationCap />, <Award />, <Globe2 />, <BookOpen />]; return <><PageHero label="About" title={pageText(copy, "hero_title")} copy={pageText(copy, "hero_intro")} /><section className="section shell about-intro"><div className="portrait-frame"><div className="terminal-bar"><span className="window-dots"><i /><i /><i /></span><span>Portrait</span></div><div className="portrait-media"><img src={headshot} alt="Portrait of Duke Chijimaka Jonathan" width="1254" height="1254" /><img className="portrait-glitch" src={headshot} alt="" width="1254" height="1254" aria-hidden="true" /><span className="portrait-static" aria-hidden="true" /></div><span className="portrait-status"><i /> {settings.accepting_projects === "true" ? "open to useful problems" : "currently fully booked"}</span></div><div className="about-copy"><span className="kicker">The short version</span><RevealHeading text={pageText(copy, "profile_heading")} variant="decrypt" /><p>{pageText(copy, "profile_paragraph_1")}</p><p>{pageText(copy, "profile_paragraph_2")}</p><p>{pageText(copy, "profile_paragraph_3")}</p><div className="button-row"><Link className="button button-primary" to="/cv">Read the formal version <ArrowRight size={17} /></Link><a className="button button-ghost" href={settings.github_url} target="_blank" rel="noreferrer"><Github size={17} /> GitHub</a></div></div></section>
    <section className="section section-lined"><div className="shell"><SectionHead label="Proof, not posturing" title={pageText(copy, "credentials_heading")} /><div className="credential-grid">{titles.map((title, index) => <article key={title}><IconBox>{icons[index] || <Award />}</IconBox><h3>{title}</h3><p>{details[index]}</p></article>)}</div></div></section><CTA /></> }

function Contact() {
  const location = useLocation();
  const { currency, settings, page } = useContent();
  const copy = page("contact");
  const params = new URLSearchParams(location.search);
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";
  const selectedBudget = params.get("package") ? `${symbol}1,000–${symbol}2,500` : "";
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [formError, setFormError] = useState("");
  const resetSpamCheck = () => (window as typeof window & { turnstile?: { reset: () => void } }).turnstile?.reset();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    if (import.meta.env.VITE_TURNSTILE_SITE_KEY && !String(payload["cf-turnstile-response"] || "")) {
      setState("error"); setFormError("Please complete the spam check before sending your enquiry."); return;
    }
    setState("sending"); setFormError("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const body = await response.json().catch(() => ({})) as { error?: string };
      if (!response.ok) throw new Error(body.error || `The enquiry service returned HTTP ${response.status}.`);
      setState("sent"); form.reset(); resetSpamCheck();
    } catch (error) {
      setState("error"); setFormError(error instanceof Error ? error.message : pageText(copy, "error_message")); resetSpamCheck();
    }
  };
  const heroIntro = pageText(copy, "hero_intro").replace("{response_time}", settings.response_time);
  return <><PageHero label="Contact" title={pageText(copy, "hero_title")} copy={heroIntro} /><section className="section shell contact-grid"><div className="contact-aside"><TerminalWindow label="Ways to reach me"><div className="contact-lines"><a href={`mailto:${settings.contact_email}`}><Mail /><span><small>Email</small>{settings.contact_email}</span></a><a href={`tel:${settings.phone_number}`}><MessageCircle /><span><small>Phone / WhatsApp</small>{settings.phone_display}</span></a><a href={settings.github_url} target="_blank" rel="noreferrer"><Github /><span><small>GitHub</small>View profile</span></a><div><MapPin /><span><small>Service area</small>{settings.service_area}</span></div></div></TerminalWindow><div className="contact-note"><Clock3 /><p><strong>{pageText(copy, "fast_lane_heading")}</strong><span>{pageText(copy, "fast_lane_copy")}</span></p><WhatsAppLink /></div></div>
      <form className="contact-form" onSubmit={submit}><div className="form-head"><span className="kicker">New enquiry</span><RevealHeading text={pageText(copy, "form_heading")} variant="type" /></div><div className="form-row"><label>Name <input name="name" autoComplete="name" required minLength={2} maxLength={120} /></label><label>Email <input name="email" type="email" autoComplete="email" required maxLength={254} /></label></div><label>Company <span>(optional)</span><input name="company" autoComplete="organization" maxLength={160} /></label><div className="form-row"><label>Project type <select name="projectType" defaultValue={params.get("intent") === "hire" ? "Web application" : ""}><option value="" disabled>Choose one</option><option>Business website</option><option>Web application</option><option>AI automation</option><option>n8n workflow</option><option>Something unusual</option></select></label><label>Budget range <select key={currency} name="budget" defaultValue={selectedBudget}><option value="" disabled>Choose one</option><option>{`Under ${symbol}1,000`}</option><option>{`${symbol}1,000–${symbol}2,500`}</option><option>{`${symbol}2,500–${symbol}5,000`}</option><option>{`${symbol}5,000+`}</option><option>Not sure yet</option></select></label></div><label>Tell me about it <textarea name="message" required minLength={20} maxLength={5000} rows={6} placeholder={pageText(copy, "message_placeholder")} /></label><label className="consent"><input type="checkbox" name="consent" value="yes" required /><span>I’m happy for Duke to use these details to reply to my enquiry. No mailing list, no third-party sharing. <Link to="/privacy">Privacy policy</Link>.</span></label>{import.meta.env.VITE_TURNSTILE_SITE_KEY && <div className="cf-turnstile" data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY} data-theme="auto" />}<input type="text" name="website" className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" /><button className="button button-primary submit-button" disabled={state === "sending"}>{state === "sending" ? "Sending…" : <>Send enquiry <Send size={17} /></>}</button>{state === "sent" && <p className="form-status success">{pageText(copy, "success_message")}</p>}{state === "error" && <p className="form-status error" role="alert">{formError || pageText(copy, "error_message")}</p>}</form></section></>;
}

function ManagedCV() {
  const { page, settings } = useContent();
  const copy = page("cv");
  const portrait = pageText(copy, "portrait_image") || "/headshot.png";
  const cvFile = pageText(copy, "cv_file") || "/duke-chijimaka-jonathan-cv.pdf";
  const experience = zip4(pageList(copy, "experience_titles"), pageList(copy, "experience_details"), pageList(copy, "experience_employers"), pageList(copy, "experience_dates"));
  const technical = zip3(pageList(copy, "technical_titles"), pageList(copy, "technical_details"), pageList(copy, "technical_meta"));
  const education = zip3(pageList(copy, "education_titles"), pageList(copy, "education_institutions"), pageList(copy, "education_dates"));
  const certifications = zip3(pageList(copy, "certification_titles"), pageList(copy, "certification_providers"), pageList(copy, "certification_dates"));
  return <><PageHero label="CV" title={pageText(copy, "hero_title")} copy={pageText(copy, "hero_intro")} /><section className="section shell cv-layout"><aside><div className="portrait-mini"><img src={portrait} alt="Portrait of Duke Chijimaka Jonathan" width="1254" height="1254" /></div><h2>Duke Chijimaka Jonathan</h2><p>{pageList(copy, "sidebar_roles").map(role => <span className="cv-role" key={role}>{role}</span>)}</p><a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a><span>{pageText(copy, "sidebar_location")}</span><a className="button button-primary" href={cvFile} download><Download size={17} /> Download CV</a></aside><div className="cv-main"><CVSection title="Profile"><p>{pageText(copy, "profile_copy")}</p></CVSection><CVSection title="Selected outcomes"><ul>{pageList(copy, "outcome_items").map(item => <li key={item}>{item}</li>)}</ul></CVSection><CVSection title="Experience">{experience.map(([title, detail, employer, dates]) => <div className="cv-entry cv-entry-detail" key={title}><div><strong>{title}</strong><p>{detail}</p></div><span><strong>{employer}</strong><small>{dates}</small></span></div>)}</CVSection><CVSection title="Selected technical work">{technical.map(([title, detail, metaText]) => <div className="cv-entry cv-entry-detail" key={title}><div><strong>{title}</strong><p>{detail}</p></div><span>{metaText}</span></div>)}</CVSection><CVSection title="Core capabilities"><div className="tag-row">{pageList(copy, "capabilities").map(item => <span key={item}>{item}</span>)}</div></CVSection><CVSection title="Education & recognition">{education.map(([title, institution, dates]) => <div className="cv-entry" key={title}><strong>{title}</strong><span><strong>{institution}</strong><small>{dates}</small></span></div>)}</CVSection><CVSection title="Certifications">{certifications.map(([title, provider, dates]) => <div className="cv-entry" key={title}><strong>{title}</strong><span><strong>{provider}</strong><small>{dates}</small></span></div>)}</CVSection></div></section></>;
}
function CVSection({ title, children }: { title: string; children: ReactNode }) { return <section><span className="kicker">{title}</span>{children}</section> }

function Blog() { const { blogPosts, page } = useContent(); const copy = page("blog"); return <><PageHero label="Articles" title={pageText(copy, "hero_title")} copy={pageText(copy, "hero_intro")} /><section className="section shell">{blogPosts.length ? <div className="blog-grid">{blogPosts.map((post, i) => <article key={post.id}>{post.coverImage && <img className="blog-card-image" src={post.coverImage} alt="" loading="lazy" />}<span className="kicker">Article · {String(i + 1).padStart(2, "0")}</span><RevealHeading text={post.title} variant="decrypt" /><p>{post.excerpt}</p>{post.publishedAt && <time className="muted" dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>}<Link className="blog-read-link" to={`/articles/${post.slug}`}>Read article <ArrowRight size={15} /></Link></article>)}</div> : <TerminalWindow label="Articles"><div className="empty-state"><BookOpen /><RevealHeading text={pageText(copy, "empty_heading")} variant="type" /><p>{pageText(copy, "empty_copy")}</p></div></TerminalWindow>}</section></> }

function LegacyArticleRedirect() { const { slug } = useParams(); return <Navigate to={`/articles/${slug || ""}`} replace />; }

function BlogDetail() {
  const { slug } = useParams();
  const { blogPosts, loading } = useContent();
  const post = blogPosts.find(item => item.slug === slug);
  const cleanBody = useMemo(() => DOMPurify.sanitize(post?.body || ""), [post?.body]);
  if (loading) return <section className="not-found"><span>…</span><h1>Loading article.</h1></section>;
  if (!post) return <section className="not-found"><span>404</span><h1>That article isn’t available.</h1><p>The address may have changed, or the article may have been removed.</p><Link className="button button-primary" to="/articles">Return to articles <ArrowRight size={16} /></Link></section>;
  const words = (post.body || "").replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
  return <><section className="blog-article-hero"><div className="shell"><Link className="back-link" to="/articles">← Back to articles</Link><span className="kicker">Article</span><h1>{post.title}</h1><p>{post.excerpt}</p><div><time dateTime={post.publishedAt}>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : ""}</time><span>{Math.max(1, Math.ceil(words / 220))} min read</span></div></div></section>{post.coverImage && <img className="blog-cover" src={post.coverImage} alt="" />}<article className="section shell blog-article"><div className="blog-prose" dangerouslySetInnerHTML={{ __html: cleanBody }} /></article><CTA /></>;
}

function Legal({ type }: { type: "privacy" | "cookies" | "terms" }) { const copy = useContent().page(type); const titles = pageList(copy, "section_titles"); const copies = pageList(copy, "section_copies"); return <><PageHero label="Policies and terms" title={pageText(copy, "hero_title")} copy={pageText(copy, "hero_intro")}><span className="legal-date">Last updated: {pageText(copy, "updated_date")}</span></PageHero><section className="section shell legal-copy">{titles.map((title, index) => <section key={title}><span>0{index + 1}</span><div><RevealHeading text={title} variant="type" /><p>{copies[index]}</p></div></section>)}</section></> }

function CTA() { const copy = useContent().page("common"); return <section className="final-cta"><div className="shell"><span className="kicker">Start a conversation</span><RevealHeading text={pageText(copy, "cta_heading")} variant="decrypt" /><p>{pageText(copy, "cta_copy")}</p><div className="button-row"><Link className="button button-primary" to="/contact">Start a project <ArrowRight size={17} /></Link><WhatsAppLink /></div></div></section> }
function NotFound() { const copy = useContent().page("common"); return <section className="not-found"><span>404</span><h1>{pageText(copy, "not_found_heading")}</h1><p>{pageText(copy, "not_found_copy")}</p><Link className="button button-primary" to="/">Return home <ArrowRight size={16} /></Link></section> }

function pageText(content: PageContent, key: string) { const value = content[key]; return typeof value === "string" ? value : ""; }
function pageList(content: PageContent, key: string) { const value = content[key]; return Array.isArray(value) ? value : []; }
function zip2(left: string[], right: string[]) { return left.map((value, index) => [value, right[index] || ""] as const); }
function zip3(first: string[], second: string[], third: string[]) { return first.map((value, index) => [value, second[index] || "", third[index] || ""] as const); }
function zip4(first: string[], second: string[], third: string[], fourth: string[]) { return first.map((value, index) => [value, second[index] || "", third[index] || "", fourth[index] || ""] as const); }
