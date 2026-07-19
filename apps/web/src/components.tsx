import { CSSProperties, FormEvent, KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Check, ChevronDown, Cookie, Github, Instagram, Linkedin, Menu, MessageCircle, Moon, Send, Sun, Terminal, X } from "lucide-react";
import { SiClaude, SiCloudflare, SiDrizzle, SiN8N, SiNextdotjs, SiNodedotjs, SiReact, SiTypescript, SiVite } from "react-icons/si";
import { TbBrandOpenai } from "react-icons/tb";
import { RevealHeading, usePageMotion } from "./motion";
import { useContent } from "./content";
import { businessFacts } from "./site";

export function IconBox({ children }: { children: ReactNode }) {
  return <span className="icon-box" aria-hidden="true">{children}</span>;
}

export function Logo() {
  return <Link className="logo" to="/" aria-label="Build With Duke home">
    <svg className="brand-mark" aria-hidden="true" width="42" height="42" viewBox="0 0 1080 1080">
      <use href="/logo.svg#brand-logo" />
    </svg>
    <span className="logo-wordmark" aria-hidden="true"><span className="brand-syntax">&lt;</span><span className="brand-build">BUILD</span><span className="brand-with"> WITH </span><span className="brand-duke">DUKE</span><span className="brand-syntax">/&gt;</span></span>
  </Link>;
}

const nav = [["Work", "/projects"], ["Services", "/services"], ["About", "/about"], ["Pricing", "/pricing"], ["Contact", "/contact"]];

export function Layout({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const location = useLocation();
  usePageMotion(location.pathname);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("theme", theme); }, [theme]);
  useEffect(() => { const update = (event: Event) => setTheme(String((event as CustomEvent<string>).detail)); window.addEventListener("daemon-theme", update); return () => window.removeEventListener("daemon-theme", update); }, []);
  useEffect(() => { setMenu(false); window.scrollTo({ top: 0, behavior: "instant" }); }, [location.pathname]);
  useEffect(() => {
    if (!menu || !window.matchMedia("(max-width: 900px)").matches) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [menu]);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <div className="shell header-inner">
        <Logo />
        <nav className={menu ? "nav open" : "nav"} aria-label="Main navigation">
          {nav.map(([label, href]) => <NavLink key={href} to={href}>{label}</NavLink>)}
        </nav>
        <div className="header-actions">
          <button className="icon-button" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title="Change colour theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="icon-button menu-button" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Toggle navigation">
            {menu ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
    <main id="main">{children}</main>
    <Footer />
    <ConsentAnalytics />
    <Daemon />
    <CookieConsent />
  </>;
}

function ConsentAnalytics() {
  const location = useLocation();
  const [enabled, setEnabled] = useState(() => {
    try { return Boolean(JSON.parse(localStorage.getItem("cookie-preferences") || "{}").analytics); } catch { return false; }
  });
  useEffect(() => {
    const update = (event: Event) => setEnabled(Boolean((event as CustomEvent<{ analytics?: boolean }>).detail.analytics));
    window.addEventListener("cookie-consent-changed", update);
    return () => window.removeEventListener("cookie-consent-changed", update);
  }, []);
  useEffect(() => {
    const domain = import.meta.env.VITE_PLAUSIBLE_DOMAIN;
    if (!enabled || !domain || document.querySelector("script[data-duke-analytics]")) return;
    const script = document.createElement("script"); script.defer = true; script.dataset.dukeAnalytics = "true"; script.dataset.domain = domain; script.src = "https://plausible.io/js/script.js"; document.head.appendChild(script);
  }, [enabled]);
  useEffect(() => {
    if (!enabled) return;
    const plausible = (window as typeof window & { plausible?: (name: string, options?: unknown) => void }).plausible;
    plausible?.("pageview", { u: window.location.href });
  }, [enabled, location.pathname]);
  return null;
}

function Footer() {
  const { settings } = useContent();
  const whatsappUrl = `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent("Hi Duke, I found your site and want to talk about a project.")}`;
  return <footer className="footer">
    <div className="shell footer-grid">
      <div><Logo /><p className="muted">Full-stack products and useful automation.<br />Remote · UK-wide.</p></div>
      <div><span className="kicker">Go somewhere</span>{nav.slice(0, 4).map(([label, href]) => <Link key={href} to={href}>{label}</Link>)}</div>
      <div><span className="kicker">Start a conversation</span><a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a><a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp · {settings.phone_display} <ArrowUpRight size={14} /></a></div>
      <div><span className="kicker">Find me</span><a href={settings.github_url} target="_blank" rel="noreferrer"><Github size={15} /> GitHub</a><a href={settings.instagram_url} target="_blank" rel="noreferrer"><Instagram size={15} /> Instagram</a><a href={settings.linkedin_url} target="_blank" rel="noreferrer"><Linkedin size={15} /> LinkedIn</a></div>
    </div>
    <div className="shell business-facts" aria-label="Business facts"><span>{settings.business_name} · {businessFacts.industry}</span><span>{settings.service_area} · {businessFacts.hours}</span><span>{businessFacts.paymentMethods}</span></div>
    <div className="shell footer-bottom"><span>© {new Date().getFullYear()} {settings.business_name}</span><span><Link to="/privacy">Privacy</Link> · <Link to="/cookies">Cookies</Link> · <Link to="/terms">Terms</Link> · <button className="footer-preferences" onClick={() => window.dispatchEvent(new Event("open-cookie-preferences"))}>Cookie preferences</button></span><Link className="built-with-love" to="/about">// built with <span role="img" aria-label="love">❤️</span></Link></div>
  </footer>;
}

export function TerminalWindow({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <article className={`terminal-window ${className}`}><div className="terminal-bar"><span className="window-dots"><i /><i /><i /></span><span>{label}</span></div>{children}</article>;
}

export function SectionHead({ label, title, copy }: { label: string; title: string; copy?: string }) {
  return <div className="section-head"><span className="kicker">{label}</span><RevealHeading text={title} variant="decrypt" />{copy && <p>{copy}</p>}</div>;
}

const technologies = [
  [SiReact, "React"], [SiTypescript, "TypeScript"], [SiCloudflare, "Cloudflare"],
  [SiNextdotjs, "Next.js"], [SiN8N, "n8n"], [TbBrandOpenai, "OpenAI"],
  [SiClaude, "Claude"], [SiNodedotjs, "Node.js"], [SiDrizzle, "Drizzle"], [SiVite, "Vite"],
] as const;

export function TechTicker() {
  return <div className="stack-ticker" aria-label="Technology stack"><div className="ticker-track">{[false, true].map(duplicate => <div className="ticker-group" aria-hidden={duplicate || undefined} key={String(duplicate)}>{technologies.map(([Icon, label]) => <span className="ticker-item" key={label} aria-label={duplicate ? undefined : label} title={label}><Icon /></span>)}</div>)}</div></div>;
}

export function ProjectVisual({ image, title }: { image: string; title: string }) {
  return <div className="project-visual"><img src={image} alt={`${title} website preview`} loading="lazy" /><span className="visual-scan" /></div>;
}

export function FAQ({ items }: { items: string[][] }) {
  return <div className="faq-list">{items.map(([q, a], i) => <details key={q} open={i === 0}><summary><span><em>0{i + 1}</em>{q}</span><ChevronDown size={19} /></summary><p>{a}</p></details>)}</div>;
}

type Log = { id: number; text: string; tone?: string };
const boot = ["booting daemon v2.0...", "loading awareness modules...", "checking signal... online", "hello. type 'help' to begin."];

function Daemon() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [command, setCommand] = useState("");
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [customCommands, setCustomCommands] = useState<Record<string, { response: string; action?: string; target?: string }>>({});
  const navigate = useNavigate();
  const location = useLocation();
  const logId = useRef(10);
  const logEnd = useRef<HTMLDivElement>(null);
  const daemonRef = useRef<HTMLElement>(null);
  const drag = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null);
  const addLog = (text: string, tone?: string) => setLogs(old => [...old.slice(-10), { id: logId.current++, text, tone }]);

  const clampedPosition = (x: number, y: number) => {
    const bounds = daemonRef.current?.getBoundingClientRect();
    const width = bounds?.width || 340;
    const height = bounds?.height || 260;
    return {
      x: Math.min(Math.max(12, x), Math.max(12, window.innerWidth - width - 12)),
      y: Math.min(Math.max(76, y), Math.max(76, window.innerHeight - height - 12)),
    };
  };
  const beginDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(max-width: 900px)").matches || (event.target as HTMLElement).closest("button")) return;
    const bounds = daemonRef.current?.getBoundingClientRect();
    if (!bounds) return;
    drag.current = { pointerId: event.pointerId, offsetX: event.clientX - bounds.left, offsetY: event.clientY - bounds.top };
    setPosition({ x: bounds.left, y: bounds.top });
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };
  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    setPosition(clampedPosition(event.clientX - drag.current.offsetX, event.clientY - drag.current.offsetY));
  };
  const endDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current || drag.current.pointerId !== event.pointerId) return;
    drag.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const nudgeDaemon = (event: KeyboardEvent<HTMLDivElement>) => {
    const offsets: Record<string, [number, number]> = { ArrowLeft: [-16, 0], ArrowRight: [16, 0], ArrowUp: [0, -16], ArrowDown: [0, 16] };
    const offset = offsets[event.key];
    if (!offset || window.matchMedia("(max-width: 900px)").matches) return;
    const bounds = daemonRef.current?.getBoundingClientRect();
    if (!bounds) return;
    event.preventDefault();
    setPosition(clampedPosition(bounds.left + offset[0], bounds.top + offset[1]));
  };

  useEffect(() => {
    setLogs([]);
    const timers = boot.map((text, i) => window.setTimeout(() => setLogs(old => [...old, { id: i, text, tone: i === 3 ? "green" : undefined }]), 350 + i * 430));
    timers.push(window.setTimeout(() => addLog(`session: ${window.innerWidth}×${window.innerHeight} · ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`), 2250));
    return () => timers.forEach(clearTimeout);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 900px)").matches) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [open]);
  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(max-width: 900px)").matches) setPosition(null);
      else setPosition(current => current ? clampedPosition(current.x, current.y) : null);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  useEffect(() => { if (logs.length) logEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);
  useEffect(() => {
    if (logs.length < 4) return;
    addLog(`route mounted: ${location.pathname}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
  useEffect(() => {
    fetch("/api/content/daemon").then(response => response.ok ? response.json() : Promise.reject()).then((data: { commands?: Array<{ command: string; response_text: string; action_type?: string; action_target?: string }> }) => {
      const mapped = Object.fromEntries((data.commands || []).map(item => [item.command, { response: item.response_text, action: item.action_type, target: item.action_target }]));
      setCustomCommands(mapped);
    }).catch(() => undefined);
  }, []);
  useEffect(() => {
    let lastDepth = 0;
    const onScroll = () => {
      const depth = Math.min(100, Math.round((scrollY / Math.max(1, document.body.scrollHeight - innerHeight)) * 100));
      const milestone = [25, 50, 75, 90].find(n => depth >= n && lastDepth < n);
      if (milestone) addLog(`scroll depth: ${milestone}%`);
      lastDepth = depth;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    let idleTimer = window.setTimeout(() => addLog("idle 12s — still there?"), 12000);
    let pointerDistance = 0;
    let lastX: number | null = null;
    let lastY: number | null = null;
    const resetIdle = () => {
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => addLog("idle 12s — still there?"), 12000);
    };
    const onPointer = (event: PointerEvent) => {
      resetIdle();
      if (lastX !== null && lastY !== null) pointerDistance += Math.hypot(event.clientX - lastX, event.clientY - lastY);
      lastX = event.clientX; lastY = event.clientY;
      if (pointerDistance >= 1400) {
        addLog(`cursor moved ${Math.round(pointerDistance).toLocaleString("en-GB")}px`);
        pointerDistance = 0;
      }
    };
    const onClick = (event: MouseEvent) => {
      resetIdle();
      const target = (event.target as HTMLElement).closest<HTMLElement>("a, button");
      const label = target?.innerText.trim().replace(/\s+/g, " ").slice(0, 42);
      if (label) addLog(`visitor selected: ${label}`);
    };
    const onKey = () => resetIdle();
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("click", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main section"));
    if (!("IntersectionObserver" in window)) return;
    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting || seen.has(entry.target)) return;
      seen.add(entry.target);
      const section = entry.target as HTMLElement;
      const name = section.dataset.daemon || section.querySelector(".kicker")?.textContent || section.id;
      if (name) addLog(`viewing: ${name.trim().slice(0, 48)}`);
    }), { threshold: 0.45 });
    sections.forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, [location.pathname]);
  useEffect(() => {
    const onOnline = () => addLog("network restored · online", "green");
    const onOffline = () => addLog("network changed · offline");
    const onVisibility = () => {
      if (document.visibilityState === "visible") addLog("welcome back · session resumed", "green");
    };
    const themeObserver = new MutationObserver(() => addLog(`theme changed · ${document.documentElement.dataset.theme || "dark"}`));
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      themeObserver.disconnect();
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const run = (event: FormEvent) => {
    event.preventDefault();
    const value = command.trim().toLowerCase();
    if (!value) return;
    if (value === "clear") { setLogs([]); setCommand(""); return; }
    addLog(`$ ${value}`, "blue"); setCommand("");
    const replies: Record<string, string> = {
      help: "whoami · status · projects · services · pricing · contact · time · theme · clear · sudo hire-duke",
      whoami: "Duke. Full-stack developer, automation specialist, systems enjoyer.",
      coffee: "status: dangerously well-caffeinated.",
      status: `${navigator.onLine ? "online" : "offline"} · ${location.pathname} · ${Math.round((scrollY / Math.max(1, document.body.scrollHeight - innerHeight)) * 100)}% explored`,
      time: new Date().toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
      date: new Date().toLocaleDateString("en-GB", { dateStyle: "full" }),
      pwd: location.pathname,
      ls: "projects/  services/  about/  pricing/  contact/",
      theme: `current theme: ${document.documentElement.dataset.theme || "dark"}`,
      hello: "hello. I’m awake and watching the system, not your personal data.",
      hi: "hi. ask for 'status' or type 'help'.",
    };
    const custom = customCommands[value];
    if (custom) {
      addLog(custom.response, "green");
      if (custom.action === "navigate" && custom.target) window.setTimeout(() => navigate(custom.target!), 350);
      if (custom.action === "link" && custom.target) window.setTimeout(() => window.open(custom.target, "_blank", "noopener,noreferrer"), 350);
      if (custom.action === "theme" && ["light", "dark"].includes(custom.target || "")) window.setTimeout(() => window.dispatchEvent(new CustomEvent("daemon-theme", { detail: custom.target })), 150);
    }
    else if (replies[value]) addLog(replies[value], "green");
    else if (["projects", "work", "services", "pricing", "contact", "about"].includes(value)) { const target = value === "work" ? "projects" : value; addLog(`opening /${target}...`, "green"); window.setTimeout(() => navigate(`/${target}`), 350); }
    else if (["sudo hire-duke", "hire duke", "hire-duke"].includes(value)) { addLog("permission granted. good decision.", "green"); window.setTimeout(() => navigate("/contact?intent=hire"), 400); }
    else addLog(`command not found: ${value}. try 'help'.`);
  };
  if (dismissed) return <button className="daemon-orb" onClick={() => { setDismissed(false); setMinimized(false); setOpen(true); }} aria-label="Open DAEMON terminal"><Terminal size={20} /></button>;
  const daemonStyle: CSSProperties | undefined = position ? { left: position.x, top: position.y, right: "auto", bottom: "auto" } : undefined;
  const daemonClass = ["daemon", open ? "open" : "", minimized ? "minimized" : "", maximized ? "maximized" : ""].filter(Boolean).join(" ");
  return <aside ref={daemonRef} style={daemonStyle} className={daemonClass} aria-label="DAEMON interactive terminal">
    <button className="daemon-mobile-trigger" onClick={() => { setOpen(true); setMinimized(false); }} aria-expanded={open}><Terminal size={18} /> <span>DAEMON</span><i>online</i></button>
    <div className="daemon-panel">
      <div className="daemon-bar" role="toolbar" tabIndex={0} aria-label="Move DAEMON terminal. Drag, or use the arrow keys." onPointerDown={beginDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onKeyDown={nudgeDaemon}>
        <span className="daemon-controls">
          <button className="daemon-control daemon-control-close" onClick={() => { setDismissed(true); setMaximized(false); }} aria-label="Close terminal" title="Close" />
          <button className="daemon-control daemon-control-minimize" onClick={() => { setMinimized(value => !value); setMaximized(false); }} aria-label={minimized ? "Restore terminal" : "Minimize terminal"} title={minimized ? "Restore" : "Minimize"} />
          <button className="daemon-control daemon-control-maximize" onClick={() => { setMaximized(value => !value); setMinimized(false); }} aria-label={maximized ? "Restore terminal" : "Maximize terminal"} title={maximized ? "Restore" : "Maximize"} />
        </span>
        <strong>DAEMON</strong>
      </div>
      <div className="daemon-content">
        <div className="daemon-logs" aria-live="polite">{logs.map(log => <div className={log.tone || ""} key={log.id}><span>›</span> {log.text}</div>)}<div ref={logEnd} /></div>
        <form className="daemon-input" onSubmit={run}><label htmlFor="daemon-command">$</label><input id="daemon-command" value={command} onChange={e => setCommand(e.target.value)} placeholder="ask me or type help" autoComplete="off" /><button aria-label="Run command"><Send size={15} /></button></form>
        <button className="daemon-close-mobile" onClick={() => setOpen(false)}>Close terminal</button>
      </div>
    </div>
  </aside>;
}

function CookieConsent() {
  const [mode, setMode] = useState<"hidden" | "main" | "manage">(() => localStorage.getItem("cookie-preferences") ? "hidden" : "main");
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const open = () => {
      const saved = JSON.parse(localStorage.getItem("cookie-preferences") || "{}") as { analytics?: boolean; marketing?: boolean };
      setAnalytics(Boolean(saved.analytics)); setMarketing(Boolean(saved.marketing)); setMode("manage");
    };
    window.addEventListener("open-cookie-preferences", open);
    return () => window.removeEventListener("open-cookie-preferences", open);
  }, []);
  useEffect(() => { if (mode !== "hidden") window.setTimeout(() => dialog.current?.querySelector<HTMLButtonElement>("button")?.focus(), 0); }, [mode]);
  const choose = (nextAnalytics: boolean, nextMarketing: boolean) => {
    const preferences = { necessary: true, analytics: nextAnalytics, marketing: nextMarketing, updatedAt: new Date().toISOString() };
    localStorage.setItem("cookie-preferences", JSON.stringify(preferences));
    window.dispatchEvent(new CustomEvent("cookie-consent-changed", { detail: preferences }));
    fetch("/api/consent", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(preferences) }).catch(() => undefined);
    setMode("hidden");
  };
  if (mode === "hidden") return null;
  return <div className="cookie-backdrop"><div ref={dialog} className="cookie-panel" role="dialog" aria-modal="true" aria-labelledby="cookie-title" aria-describedby="cookie-copy">
    <div className="cookie-icon"><Cookie size={22} /></div>
    <div className="cookie-copy"><strong id="cookie-title">{mode === "manage" ? "Choose what runs" : "Your privacy, centred."}</strong>{mode === "main" ? <p id="cookie-copy">Necessary storage remembers your theme and privacy choice. Optional analytics and marketing stay off until you choose them. Nothing creepy.</p> : <div className="cookie-options"><label><span>Necessary <small>Theme, security and consent memory</small></span><input type="checkbox" checked disabled /></label><label><span>Analytics <small>Anonymous site usage, when configured</small></span><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /></label><label><span>Marketing <small>Off by default; no advertising trackers installed</small></span><input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} /></label></div>}</div>
    <div className="cookie-actions">{mode === "main" ? <><button className="button button-primary" onClick={() => choose(true, true)}>Accept all</button><button className="button button-ghost" onClick={() => choose(false, false)}>Reject optional</button><button className="text-button" onClick={() => setMode("manage")}>Manage preferences</button></> : <><button className="button button-primary" onClick={() => choose(analytics, marketing)}><Check size={16} /> Save choices</button><button className="button button-ghost" onClick={() => choose(false, false)}>Reject optional</button></>}</div>
    <Link className="cookie-policy-link" to="/cookies">Read the cookie policy</Link>
  </div></div>;
}

export function WhatsAppLink({ children = "Message on WhatsApp", className = "button button-secondary" }: { children?: ReactNode; className?: string }) {
  const { settings } = useContent();
  const url = `https://wa.me/${settings.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent("Hi Duke, I found your site and want to talk about a project.")}`;
  return <a className={className} href={url} target="_blank" rel="noreferrer"><MessageCircle size={17} />{children}</a>;
}
