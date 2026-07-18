import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Route, Routes, useLocation, useParams } from "react-router-dom";
import { ArrowDown, ArrowRight, ArrowUpRight, Award, BookOpen, Bot, Check, CheckCircle2, CircleDot, Clock3, Code2, Download, ExternalLink, Github, Globe2, GraduationCap, Mail, MapPin, MessageCircle, Send, ShieldCheck, Workflow, Wrench } from "lucide-react";
import { FAQ, IconBox, Layout, ProjectVisual, SectionHead, TechTicker, TerminalWindow, WhatsAppLink } from "./components";
import { faq } from "./data";
import { ContentProvider, Testimonial, useContent } from "./content";
import { RevealHeading, RotatingTypingText } from "./motion";
import { CONTACT_EMAIL, GITHUB_URL, PHONE_DISPLAY, PHONE_NUMBER, SITE_URL } from "./site";
import Admin from "./Admin";

const meta: Record<string, [string, string]> = {
  "/": ["buildwithduke — Full-stack developer & AI automation specialist", "I build fast web products and useful AI automations for UK founders and small businesses."],
  "/projects": ["Projects — buildwithduke", "Live web products, software and automation projects built by Duke."],
  "/services": ["Services — buildwithduke", "Full-stack web development, AI automation and n8n workflows for UK businesses."],
  "/pricing": ["Pricing — buildwithduke", "Clear GBP packages for websites, web applications and automation."],
  "/about": ["About Duke — buildwithduke", "Full-stack developer, AI automation specialist and systems thinker."],
  "/contact": ["Start a project — buildwithduke", "Tell Duke what you need to build, fix or automate."],
  "/cv": ["Duke’s CV — buildwithduke", "Duke Chijimaka Jonathan’s experience, technical stack, education and selected outcomes."],
  "/blog": ["Build log — buildwithduke", "Practical notes on web systems, AI-assisted development and automation."],
  "/privacy": ["Privacy policy — buildwithduke", "How buildwithduke handles enquiry and website data."],
  "/cookies": ["Cookie policy — buildwithduke", "Necessary storage and optional consent choices on buildwithduke."],
  "/terms": ["Website terms — buildwithduke", "Terms for using the buildwithduke portfolio website."],
};

function PageMeta() {
  const { pathname } = useLocation();
  const { projects } = useContent();
  useEffect(() => {
    const key = pathname.startsWith("/projects/") ? "/projects" : pathname;
    const project = pathname.startsWith("/projects/") ? projects.find(item => item.slug === pathname.split("/").pop()) : undefined;
    const value = project ? [`${project.title} case study — buildwithduke`, project.description] : meta[key] || ["buildwithduke", "Full-stack products and useful automation."];
    document.title = value[0];
    document.querySelector('meta[name="description"]')?.setAttribute("content", value[1]);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", value[0]);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", value[1]);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", `${SITE_URL}${pathname}`);
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", `${SITE_URL}${pathname}`);
    const oldSchema = document.getElementById("route-schema"); oldSchema?.remove();
    const schema = project ? { "@context": "https://schema.org", "@type": "CreativeWork", name: project.title, description: project.description, url: `${SITE_URL}/projects/${project.slug}`, image: `${SITE_URL}${project.image}`, author: { "@type": "Person", name: "Duke Chijimaka Jonathan", url: `${SITE_URL}/about` }, keywords: project.stack.join(", ") } : pathname === "/pricing" || pathname === "/" ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) } : null;
    if (schema) { const script = document.createElement("script"); script.id = "route-schema"; script.type = "application/ld+json"; script.text = JSON.stringify(schema); document.head.appendChild(script); }
  }, [pathname, projects]);
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
    <Route path="/cv" element={<CV />} />
    <Route path="/blog" element={<Blog />} />
    <Route path="/privacy" element={<Legal type="privacy" />} />
    <Route path="/cookies" element={<Legal type="cookies" />} />
    <Route path="/terms" element={<Legal type="terms" />} />
    <Route path="/admin" element={<Admin />} />
    <Route path="*" element={<NotFound />} />
  </Routes></Layout></ContentProvider>;
}

function Home() {
  const { projects, pricing, testimonials } = useContent();
  return <>
    <section className="hero">
      <div className="hero-grid" aria-hidden="true" />
      <div className="shell hero-inner">
        <div className="hero-copy">
          <div className="availability"><i /> Available for select projects · Q3 2026</div>
          <h1><span>I build </span><RotatingTypingText texts={["things that work.", "web apps that feel alive.", "automations that return time.", "systems that make sense."]} /></h1>
          <p>Full-stack developer and AI automation specialist. I turn messy workflows and static ideas into fast, living web apps.</p>
          <div className="button-row"><Link className="button button-primary" to="/contact">Start a project <ArrowRight size={17} /></Link><Link className="button button-ghost" to="/projects">View live work <ArrowDown size={17} /></Link></div>
          <div className="hero-meta"><span><MapPin size={15} /> Remote · UK-wide</span><span><Clock3 size={15} /> Replies within 24h</span></div>
        </div>
        <div className="hero-system" aria-label="Current system status">
          <div className="system-head"><span>duke@buildwithduke:~</span><CircleDot size={16} /></div>
          <div className="system-console">
            <div className="system-command"><span>$</span><code>duke --status --plain</code></div>
            <div className="system-output"><div><span>focus</span><strong>web products + AI automation</strong></div><div><span>method</span><strong>clarify → build → observe</strong></div><div><span>signal</span><strong>shipping, not theatre</strong></div></div>
            <div className="system-ready"><i /> ready for a useful problem<span aria-hidden="true">_</span></div>
          </div>
          <div className="system-stats"><div><strong>22</strong><span>public repos</span></div><div><strong>99%</strong><span>data integrity</span></div><div><strong>1st</strong><span>class honours</span></div></div>
        </div>
      </div>
      <TechTicker />
    </section>

    <section className="section shell" id="work"><SectionHead label="01 / Selected work" title="Some things I’ve shipped." copy="Real builds, real links. Open them and have a look around." />
      <div className="featured-grid">{projects.filter(p => p.featured).map(project => <TerminalWindow key={project.slug} label={`~/projects/${project.slug}`} className="project-card">
        <ProjectVisual image={project.image} title={project.title} /><div className="project-card-body"><div className="project-eyebrow">{project.eyebrow}</div><h3>{project.title}</h3><p>{project.description}</p><div className="tag-row">{project.stack.slice(0, 3).map(t => <span key={t}>{t}</span>)}</div>{project.demo && <div className="demo-note"><CircleDot size={13} /> Mockup build · live client agreement in place</div>}<div className="card-actions"><Link to={`/projects/${project.slug}`}>Case study <ArrowRight size={15} /></Link><a href={project.liveUrl} target="_blank" rel="noreferrer">Visit <ArrowUpRight size={15} /></a></div></div>
      </TerminalWindow>)}</div>
      <div className="section-end"><Link className="text-link" to="/projects">Explore every project <ArrowRight size={16} /></Link></div>
    </section>

    <section className="proof-band"><div className="shell proof-grid"><div className="whoami"><span className="prompt">$ whoami</span><blockquote>“A systems thinker who enjoys the moment a messy thing finally makes sense.”</blockquote><span className="cursor-line">duke@buildwithduke <i /></span></div><div className="proof-list">
      {[['65%', 'less manual workload', 'Automation that returns hours to the people doing the work.'], ['73%', 'lead growth', 'Digital systems designed around an outcome, not decoration.'], ['1M+', 'views in seven days', 'Campaign infrastructure ready when attention arrives.'], ['99%', 'data integrity', 'Library-science rigour applied to production software.']].map(([num, label, copy]) => <div key={num}><strong>{num}</strong><span>{label}</span><p>{copy}</p></div>)}
    </div></div></section>

    <section className="section shell"><SectionHead label="02 / The process" title="Clear steps. No mystery fog." copy="You always know what is being decided, built and tested." /><div className="process-grid">{[
      ['01', 'Discover', 'Map the problem, users, constraints and the outcome worth paying for.', '$ context --load'],
      ['02', 'Design', 'Shape the flow and visual system before expensive code decisions settle.', '$ prototype --test'],
      ['03', 'Build', 'Ship in visible increments with clean interfaces and sensible adapters.', '$ build --observe'],
      ['04', 'Launch', 'Test the real journey, document the system and stay close after go-live.', '$ deploy --steady'],
    ].map(([n, title, copy, log]) => <div key={n} className="process-step"><span>{n}</span><h3>{title}</h3><p>{copy}</p><code>{log}</code></div>)}</div></section>

    <section className="section section-lined"><div className="shell"><SectionHead label="03 / Pricing preview" title="A useful starting point." copy="Clear scopes for common builds. Anything unusual gets a clear custom proposal." /><div className="pricing-preview">{[pricing[0], pricing[2], pricing[3]].map(t => <PriceCard key={t.name} tier={t} />)}</div><div className="section-end"><Link className="text-link" to="/pricing">Compare all five packages <ArrowRight size={16} /></Link></div></div></section>

    {testimonials.length > 0 && <Testimonials items={testimonials} />}

    <section className="section shell faq-section"><SectionHead label="04 / Before you ask" title="Straight answers." /><FAQ items={faq.slice(0, 4)} /></section>
    <CTA />
  </>;
}

function Testimonials({ items }: { items: Testimonial[] }) {
  const [active, setActive] = useState(0);
  const item = items[active];
  return <section className="section shell testimonial-section" aria-label="Client feedback"><SectionHead label="04 / Client signal" title="Kind words, kept specific." copy="Real feedback only—no invented review theatre." /><TerminalWindow label="testimonials/latest" className="testimonial-terminal"><blockquote>“{item.quote}”</blockquote><div className="testimonial-meta"><span><strong>{item.authorName}</strong>{[item.authorRole, item.company].filter(Boolean).join(" · ")}</span>{items.length > 1 && <div><button aria-label="Previous testimonial" onClick={() => setActive((active - 1 + items.length) % items.length)}>←</button><span>{active + 1} / {items.length}</span><button aria-label="Next testimonial" onClick={() => setActive((active + 1) % items.length)}>→</button></div>}</div></TerminalWindow></section>;
}

function PageHero({ label, title, copy, children }: { label: string; title: string; copy: string; children?: ReactNode }) {
  return <section className="page-hero"><div className="shell"><span className="kicker">{label}</span><RevealHeading as="h1" text={title} variant="type" /><p>{copy}</p>{children}</div></section>;
}

function Projects() {
  const { projects } = useContent();
  const [filter, setFilter] = useState("All");
  const shown = useMemo(() => filter === "All" ? projects : projects.filter(p => p.category === filter), [filter]);
  return <><PageHero label="/projects" title="Built, shipped, and doing the work." copy="Web products, automation and software. The mockup builds are labelled plainly; the live links are here for inspection." />
    <section className="section shell"><div className="filter-bar" role="group" aria-label="Filter projects">{["All", "Web development", "AI automation", "Software"].map(item => <button aria-pressed={filter === item} onClick={() => setFilter(item)} key={item}>{item}</button>)}</div>
      <div className="project-index">{shown.map(project => <TerminalWindow label={`~/projects/${project.slug}`} key={project.slug} className="project-index-card"><ProjectVisual image={project.image} title={project.title} /><div className="project-card-body"><div className="project-eyebrow">{project.eyebrow}</div><h2>{project.title}</h2><p>{project.description}</p><div className="tag-row">{project.stack.map(t => <span key={t}>{t}</span>)}</div>{project.demo && <div className="demo-note"><CircleDot size={13} /> Mockup build · live client agreement in place</div>}<div className="card-actions"><Link to={`/projects/${project.slug}`}>Read case study <ArrowRight size={15} /></Link><a href={project.liveUrl} target="_blank" rel="noreferrer">Open live <ArrowUpRight size={15} /></a></div></div></TerminalWindow>)}</div>
    </section><CTA /></>;
}

function ProjectDetail() {
  const { projects } = useContent();
  const { slug } = useParams(); const project = projects.find(p => p.slug === slug);
  if (!project) return <Navigate to="/projects" replace />;
  const related = projects.filter(p => p.slug !== project.slug && p.category === project.category).slice(0, 2);
  return <><section className="case-hero"><div className="shell"><Link className="back-link" to="/projects">← All projects</Link><div className="case-title"><div><span className="kicker">{project.eyebrow}</span><RevealHeading as="h1" text={project.title} variant="type" /><p>{project.description}</p><div className="button-row"><a className="button button-primary" href={project.liveUrl} target="_blank" rel="noreferrer">Visit project <ExternalLink size={17} /></a><Link className="button button-ghost" to="/contact">Build something useful</Link></div></div><TerminalWindow label={`${project.slug}.live`}><ProjectVisual image={project.image} title={project.title} /></TerminalWindow></div></div></section>
    <section className="section shell case-body"><aside><span>Project index</span><a href="#problem">01 Problem</a><a href="#build">02 Build</a><a href="#result">03 Result</a></aside><div className="case-copy"><section id="problem"><span className="kicker">01 / The problem</span><RevealHeading text="What needed to change." variant="decrypt" /><p>{project.problem}</p></section><section id="build"><span className="kicker">02 / The build</span><RevealHeading text="The useful part." variant="decrypt" /><p>{project.solution}</p><div className="stack-list">{project.stack.map(s => <span key={s}><Check size={14} />{s}</span>)}</div></section><section id="result"><span className="kicker">03 / The result</span><RevealHeading text="What shipped." variant="decrypt" /><p>{project.result}</p>{project.demo && <div className="callout"><ShieldCheck size={20} /><span><strong>Honest mockup label</strong>This is a mockup build with a live client agreement in place. It is not presented as the client’s production storefront.</span></div>}</section></div></section>
    {related.length > 0 && <section className="section section-lined"><div className="shell"><SectionHead label="Keep looking" title="Related work." /><div className="related-grid">{related.map(p => <Link to={`/projects/${p.slug}`} key={p.slug}><span>{p.eyebrow}</span><h3>{p.title}</h3><ArrowUpRight /></Link>)}</div></div></section>}<CTA /></>;
}

const services = [
  { icon: <Code2 />, name: "Websites & web apps", copy: "Responsive, fast interfaces with the admin and data layer needed to keep them useful after launch.", list: ["React and TypeScript builds", "Cloudflare deployment", "Admin and CRUD systems", "Technical SEO and analytics"] },
  { icon: <Bot />, name: "AI automation", copy: "Agentic workflows that remove repetitive effort while keeping human judgement exactly where it matters.", list: ["Workflow discovery", "API and model integration", "Human review steps", "Monitoring and handover"] },
  { icon: <Workflow />, name: "n8n workflows", copy: "Observable automations for leads, content, CRM hygiene and the operational gaps between your tools.", list: ["Lead routing", "WordPress publishing", "CRM synchronisation", "Failure alerts"] },
  { icon: <Wrench />, name: "Systems improvement", copy: "A practical technical pass on a workflow or product that has grown harder to operate than it should be.", list: ["Architecture review", "Performance work", "Data cleanup", "Incremental rebuilds"] },
];
function Services() { return <><PageHero label="/services" title="Useful systems, not technology theatre." copy="I design and build the shortest sensible route from a messy process to a system your team can actually operate." /><section className="section shell"><div className="service-grid">{services.map((s, i) => <article key={s.name}><IconBox>{s.icon}</IconBox><span className="service-num">0{i + 1}</span><RevealHeading text={s.name} variant="type" className="service-title" /><p>{s.copy}</p><ul>{s.list.map(x => <li key={x}><Check size={15} />{x}</li>)}</ul><Link to="/contact">Discuss this service <ArrowRight size={15} /></Link></article>)}</div></section><section className="proof-band"><div className="shell service-callout"><div><span className="kicker">A useful first step</span><RevealHeading text="Not sure what the system should be yet?" variant="decrypt" /></div><p>That is normal. Start with the bottleneck, not a shopping list of technology. I’ll help map the right scope before proposing a build.</p></div></section><CTA /></> }

function PriceCard({ tier }: { tier: ReturnType<typeof useContent>["pricing"][number] }) { return <TerminalWindow label={`pricing/${tier.name.toLowerCase()}`} className={tier.popular ? "price-card popular" : "price-card"}>{tier.popular && <span className="popular-badge">Most popular</span>}<div className="price-body"><span className="price-name">{tier.name}</span><strong aria-label={`${tier.name} price ${tier.price}`}>{tier.price}</strong><p>{tier.note}</p><ul>{tier.features.map(f => <li key={f}><CheckCircle2 size={16} />{f}</li>)}</ul><Link className={tier.popular ? "button button-primary" : "button button-ghost"} to={`/contact?package=${tier.name.toLowerCase()}`}>Choose {tier.name} <ArrowRight size={16} /></Link></div></TerminalWindow> }
function Pricing() { const { pricing, currency } = useContent(); const currencyName = currency === "GBP" ? "pounds" : currency === "USD" ? "US dollars" : "euros"; return <><PageHero label="/pricing" title="Straightforward pricing, no surprises." copy={`Five practical starting points shown in ${currencyName}. The number stays the same when the symbol changes; final scope and milestones are agreed in writing.`} /><section className="section shell"><div className="currency-note" aria-live="polite"><Globe2 size={15} /><span>Showing {currency} based on your location · values are not converted</span></div><div className="pricing-full">{pricing.map(t => <PriceCard key={t.name} tier={t} />)}</div><div className="payment-note"><ShieldCheck /><div><strong>Clear commercial basics.</strong><p>Bank transfer is the only payment method currently available. No VAT is currently charged. You retain ownership after final payment.</p></div></div></section><section className="section section-lined"><div className="shell faq-section"><SectionHead label="Pricing FAQ" title="The practical bits." /><FAQ items={faq} /></div></section><CTA /></> }

function About() { return <><PageHero label="/about" title="Hi, I’m Duke." copy="I like systems, clean hand-offs, and the exact moment a complicated thing becomes understandable." /><section className="section shell about-intro"><div className="portrait-frame"><div className="terminal-bar"><span className="window-dots"><i /><i /><i /></span><span>duke.profile</span></div><div className="portrait-media"><img src="/headshot.png" alt="Portrait of Duke Chijimaka Jonathan" width="1254" height="1254" /><img className="portrait-glitch" src="/headshot.png" alt="" width="1254" height="1254" aria-hidden="true" /><span className="portrait-static" aria-hidden="true" /></div><span className="portrait-status"><i /> open to useful problems</span></div><div className="about-copy"><span className="kicker">The short version</span><RevealHeading text="Library-science rigour. Product-builder energy." variant="decrypt" /><p>I’m a full-stack developer and AI automation specialist with a First-Class B.LIS (4.6/5.0) from the University of Port Harcourt. That information-science background still shapes the work: understand the information, understand the people, then make the system make sense.</p><p>I build with React, Cloudflare, Python and n8n, using agentic AI-assisted workflows to move quickly without outsourcing judgement. The output still has to be testable, maintainable and useful when the novelty wears off.</p><p>Away from a screen, I tend to drift toward origami, astronomy and theology: three different ways of asking what structure is hiding underneath the surface.</p><div className="button-row"><Link className="button button-primary" to="/cv">Read the formal version <ArrowRight size={17} /></Link><a className="button button-ghost" href={GITHUB_URL} target="_blank" rel="noreferrer"><Github size={17} /> GitHub</a></div></div></section>
    <section className="section section-lined"><div className="shell"><SectionHead label="Proof, not posturing" title="A few useful coordinates." /><div className="credential-grid">{[[<GraduationCap />, 'First-Class Honours', 'B.LIS · CGPA 4.6/5.0'], [<Award />, 'Best Graduating Student', 'Library & Information Science · 2025'], [<Globe2 />, 'SUSI Exchange Alumnus', 'University of Nevada, Reno · 2025'], [<BookOpen />, 'Original research', 'AI’s impact on academic-library cataloguing']].map(([icon, title, copy]) => <article key={String(title)}><IconBox>{icon}</IconBox><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section><CTA /></> }

function Contact() {
  const location = useLocation();
  const { currency } = useContent();
  const params = new URLSearchParams(location.search);
  const symbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "£";
  const selectedBudget = params.get("package") ? `${symbol}1,000–${symbol}2,500` : "";
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setState("sending"); const form = event.currentTarget; const payload = Object.fromEntries(new FormData(form));
    try { const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); if (!response.ok) throw new Error(); setState("sent"); form.reset(); } catch { setState("error"); }
  };
  return <><PageHero label="/contact" title="Let’s talk." copy="Tell me what is stuck, missing or ready to become real. I usually reply within 24 hours, UK time." /><section className="section shell contact-grid"><div className="contact-aside"><TerminalWindow label="contact.channels"><div className="contact-lines"><a href={`mailto:${CONTACT_EMAIL}`}><Mail /><span><small>Email</small>{CONTACT_EMAIL}</span></a><a href={`tel:${PHONE_NUMBER}`}><MessageCircle /><span><small>Phone / WhatsApp</small>{PHONE_DISPLAY}</span></a><a href={GITHUB_URL} target="_blank" rel="noreferrer"><Github /><span><small>GitHub</small>@build-with-duke</span></a><div><MapPin /><span><small>Service area</small>Remote · UK-wide</span></div></div></TerminalWindow><div className="contact-note"><Clock3 /><p><strong>Prefer the fast lane?</strong>WhatsApp is often the quickest route for a first conversation.</p><WhatsAppLink /></div></div>
      <form className="contact-form" onSubmit={submit}><div className="form-head"><span className="kicker">New enquiry</span><RevealHeading text="What are we building?" variant="type" /></div><div className="form-row"><label>Name <input name="name" autoComplete="name" required minLength={2} /></label><label>Email <input name="email" type="email" autoComplete="email" required /></label></div><label>Company <span>(optional)</span><input name="company" autoComplete="organization" /></label><div className="form-row"><label>Project type <select name="projectType" defaultValue={params.get("intent") === "hire" ? "Web application" : ""}><option value="" disabled>Choose one</option><option>Business website</option><option>Web application</option><option>AI automation</option><option>n8n workflow</option><option>Something unusual</option></select></label><label>Budget range <select key={currency} name="budget" defaultValue={selectedBudget}><option value="" disabled>Choose one</option><option>{`Under ${symbol}1,000`}</option><option>{`${symbol}1,000–${symbol}2,500`}</option><option>{`${symbol}2,500–${symbol}5,000`}</option><option>{`${symbol}5,000+`}</option><option>Not sure yet</option></select></label></div><label>Tell me about it <textarea name="message" required minLength={20} rows={6} placeholder="What needs to change, who is it for, and what would a good result look like?" /></label><label className="consent"><input type="checkbox" name="consent" value="yes" required /><span>I’m happy for Duke to use these details to reply to my enquiry. No mailing list, no third-party sharing. <Link to="/privacy">Privacy policy</Link>.</span></label>{import.meta.env.VITE_TURNSTILE_SITE_KEY && <div className="cf-turnstile" data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY} data-theme="auto" />}<input type="text" name="website" className="honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" /><button className="button button-primary submit-button" disabled={state === "sending"}>{state === "sending" ? "Sending…" : <>Send enquiry <Send size={17} /></>}</button>{state === "sent" && <p className="form-status success">Received. I’ll reply within 24 hours, UK time.</p>}{state === "error" && <p className="form-status error">The form endpoint is not connected in this preview. Email or WhatsApp still works.</p>}</form></section></>;
}

function CV() { return <><PageHero label="/cv" title="The formal version." copy="Experience, credentials and the work behind the quieter confidence." /><section className="section shell cv-layout"><aside><div className="portrait-mini"><img src="/headshot.png" alt="Portrait of Duke Chijimaka Jonathan" width="1254" height="1254" /></div><h2>Duke Chijimaka Jonathan</h2><p>Full-stack developer<br />AI & automation specialist<br />Information systems</p><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><span>Port Harcourt, Nigeria · Remote</span><a className="button button-primary" href="/duke-chijimaka-jonathan-cv.pdf" download><Download size={17} /> Download CV</a></aside><div className="cv-main"><CVSection title="Profile"><p>Product-minded full-stack developer and automation specialist combining web engineering, agentic workflows and information-systems discipline. Experienced in shipping Cloudflare-hosted products, custom admin systems, AI pipelines and open-source library software.</p></CVSection><CVSection title="Selected outcomes"><ul><li>Reduced manual workload by 65% by redesigning CRM and Excel record workflows.</li><li>Supported 73% growth in warm lead generation and a campaign exceeding 1M views in seven days.</li><li>Maintained 99% data integrity across more than 500 operational records.</li><li>Built deterministic MARC21 and ISBD quality guardrails into a production Koha plugin.</li></ul></CVSection><CVSection title="Experience"><div className="cv-entry cv-entry-detail"><div><strong>Digital Marketer & Web Manager</strong><p>Managed WordPress, structured HubSpot and Excel systems, performance analytics, and AI-assisted content operations. Improved record workflows and supported email, SMS and campaign execution.</p></div><span>Bedum Estate Management & Development LTD<br />Nov 2025 – Apr 2026</span></div><div className="cv-entry cv-entry-detail"><div><strong>Administrative Assistant</strong><p>Maintained 500+ records at 99% data integrity, improved inventory workflows and supported technical, administrative and social operations.</p></div><span>FOBSI International<br />Sep 2021 – Sep 2022</span></div><div className="cv-entry cv-entry-detail"><div><strong>Computer Operator</strong><p>Managed clerical and technical operations for 300+ client records and improved installation and support processes.</p></div><span>Twistreal Global Services<br />Sep 2020 – Sep 2021</span></div></CVSection><CVSection title="Selected technical work"><div className="cv-entry cv-entry-detail"><div><strong>Koha ISBD Cataloguing Assistant</strong><p>JavaScript and Perl plugin with deterministic ISBD checks, MARC21 guardrails, save blocking, tests and optional constrained AI guidance.</p></div><span>Koha · MARC21 · Open source</span></div><div className="cv-entry cv-entry-detail"><div><strong>LinkedIn Job Hunt Pipeline</strong><p>Scheduled n8n workflow using Apify and a two-stage OpenRouter evaluation before routing matches to Sheets, Telegram and document templates.</p></div><span>n8n · OpenRouter · APIs</span></div><div className="cv-entry cv-entry-detail"><div><strong>Sora Streamlit Studio</strong><p>Python video pipeline with reference montages, concurrent generation, rate limiting, budget guardrails, remix flows and ZIP export.</p></div><span>Python · Streamlit · Sora</span></div></CVSection><CVSection title="Core capabilities"><div className="tag-row"><span>React</span><span>TypeScript</span><span>Next.js</span><span>Cloudflare</span><span>n8n</span><span>Python</span><span>Streamlit</span><span>REST APIs</span><span>OpenAI</span><span>OpenRouter</span><span>Koha</span><span>MARC21</span></div></CVSection><CVSection title="Education & recognition"><div className="cv-entry"><strong>First-Class Honours, B.LIS · CGPA 4.6/5.0</strong><span>University of Port Harcourt · 2025</span></div><div className="cv-entry"><strong>Best Graduating Student, Library & Information Science</strong><span>University of Port Harcourt · 2025</span></div><div className="cv-entry"><strong>SUSI Exchange Alumnus</strong><span>U.S. Department of State · University of Nevada, Reno · 2025</span></div><div className="cv-entry"><strong>Thesis: The Impact of Artificial Intelligence on Cataloguing</strong><span>Academic libraries in Rivers State</span></div></CVSection><CVSection title="Certifications"><div className="cv-entry"><strong>Diploma in Applied Generative AI</strong><span>Alison · In progress</span></div><div className="cv-entry"><strong>Cybersecurity Awareness: Terminology & Threat Landscape</strong><span>LinkedIn Learning · 2024</span></div><div className="cv-entry"><strong>Certified Digital Marketer</strong><span>Udemy · 2022</span></div><div className="cv-entry"><strong>Certified Administrative Professional</strong><span>CyberTech Enterprises · 2020</span></div></CVSection></div></section></> }
function CVSection({ title, children }: { title: string; children: ReactNode }) { return <section><span className="kicker">{title}</span>{children}</section> }

function Blog() { const { blogPosts } = useContent(); return <><PageHero label="/build-log" title="Notes from the workbench." copy="Clear writing on automation, web systems and the practical side of building with AI." /><section className="section shell">{blogPosts.length ? <div className="blog-grid">{blogPosts.map((post, i) => <article key={post.id}><span className="kicker">Build log · 0{i + 1}</span><RevealHeading text={post.title} variant="decrypt" /><p>{post.excerpt}</p>{post.publishedAt && <time className="muted" dateTime={post.publishedAt}>{new Date(post.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>}</article>)}</div> : <TerminalWindow label="build-log/status"><div className="empty-state"><BookOpen /><RevealHeading text="Notes are compiling." variant="type" /><p>Published build logs will appear here. I’m choosing useful writing over placeholder articles.</p></div></TerminalWindow>}</section></> }

const legal = {
  privacy: { title: "Privacy policy", updated: "17 July 2026", intro: "This policy explains what information I collect through buildwithduke, why I collect it, and the choices you have.", sections: [["Who controls your data", "Duke Chijimaka Jonathan, trading as buildwithduke, is the data controller. Contact buildwithduke@outlook.com for any privacy request."], ["What I collect", "When you send an enquiry, I collect your name, email, optional company, project details and consent record. Basic server security logs may also record an IP address temporarily."], ["Why and how long", "I use enquiry data only to respond, prepare a proposal and keep necessary business records. Unconverted enquiries are reviewed and deleted after 12 months."], ["Your rights", "Under UK data protection law you may ask to access, correct, erase, restrict or export your personal information, and you may object to processing."], ["Service providers", "Cloudflare may process delivery and security data. Resend processes enquiry emails when configured. Data is not sold and is not used for unrelated marketing."]]},
  cookies: { title: "Cookie policy", updated: "17 July 2026", intro: "This site starts with necessary storage only. Optional analytics and marketing stay off until you choose them.", sections: [["Necessary storage", "The site stores your colour theme and cookie choice locally in your browser. These are required to remember the settings you selected."], ["Analytics", "Anonymous analytics may be enabled only after consent and only when a production analytics provider is configured. It is used to understand performance and broad usage, not to build an advertising profile."], ["Marketing", "No advertising trackers are currently installed. The separate marketing choice prevents future marketing technology from running without your explicit permission."], ["Changing your choice", "Use the Cookie preferences button in the footer at any time to review or change optional consent. Your new choice takes effect immediately."], ["Third-party links", "Links to GitHub, Instagram, WhatsApp and live projects follow those services' own privacy and cookie policies once opened."]]},
  terms: { title: "Website terms", updated: "17 July 2026", intro: "These terms cover use of this portfolio. Project work is governed by a separate written proposal and contract.", sections: [["Information", "I aim to keep project, service and pricing information accurate, but website content is general information rather than a binding offer."], ["Intellectual property", "Unless stated otherwise, the writing, design and original code on this site belong to Duke Chijimaka Jonathan. Client project names and brands belong to their respective owners."], ["External links", "Live project and social links are provided for convenience. I do not control third-party availability, content or security."], ["Project pricing", "Displayed package prices are starting points. Scope, delivery, payment milestones, ownership and support are confirmed in a written agreement before work begins."], ["Liability", "Nothing here limits liability where it cannot legally be limited. Otherwise, use of this informational website is at your own risk."]]},
};
function Legal({ type }: { type: keyof typeof legal }) { const doc = legal[type]; return <><PageHero label="/legal" title={doc.title} copy={doc.intro}><span className="legal-date">Last updated: {doc.updated}</span></PageHero><section className="section shell legal-copy">{doc.sections.map(([title, copy], i) => <section key={title}><span>0{i + 1}</span><div><RevealHeading text={title} variant="type" /><p>{copy}</p></div></section>)}</section></> }

function CTA() { return <section className="final-cta"><div className="shell"><span className="kicker">$ sudo start-project</span><RevealHeading text="Got something messy that needs to make sense?" variant="decrypt" /><p>Good. That’s usually where the useful work starts.</p><div className="button-row"><Link className="button button-primary" to="/contact">Start a project <ArrowRight size={17} /></Link><WhatsAppLink /></div></div></section> }
function NotFound() { return <section className="not-found"><span>404</span><h1>That route wandered off.</h1><p>DAEMON checked twice. There is nothing deployed here.</p><Link className="button button-primary" to="/">Return home <ArrowRight size={16} /></Link></section> }
