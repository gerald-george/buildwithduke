import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ArrowUpRight, Check, ChevronDown, Cookie, Github, Linkedin, Menu, MessageCircle, Moon, Send, Sun, Terminal, X } from "lucide-react";

export const WA_URL = "https://wa.me/447000000000?text=Hi%20Duke%2C%20I%20found%20your%20site%20and%20want%20to%20talk%20about%20a%20project.";

export function IconBox({ children }: { children: ReactNode }) {
  return <span className="icon-box" aria-hidden="true">{children}</span>;
}

export function Logo() {
  return <Link className="logo" to="/" aria-label="buildwithduke home"><span>&lt;</span>BUILD WITH <b>DUKE</b><span>/&gt;</span></Link>;
}

const nav = [["Work", "/projects"], ["Services", "/services"], ["About", "/about"], ["Pricing", "/pricing"], ["Contact", "/contact"]];

export function Layout({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const location = useLocation();
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("theme", theme); }, [theme]);
  useEffect(() => { setMenu(false); window.scrollTo({ top: 0, behavior: "instant" }); }, [location.pathname]);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <div className="shell header-inner">
        <div className="window-dots" aria-hidden="true"><i /><i /><i /></div>
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
    <Daemon />
    <CookieConsent />
  </>;
}

function Footer() {
  return <footer className="footer">
    <div className="shell footer-grid">
      <div><Logo /><p className="muted">Full-stack products and useful automation.<br />Remote · UK-wide.</p></div>
      <div><span className="kicker">Go somewhere</span>{nav.slice(0, 4).map(([label, href]) => <Link key={href} to={href}>{label}</Link>)}</div>
      <div><span className="kicker">Start a conversation</span><a href="mailto:buildwithduke@outlook.com">buildwithduke@outlook.com</a><a href={WA_URL} target="_blank" rel="noreferrer">WhatsApp <ArrowUpRight size={14} /></a></div>
      <div><span className="kicker">Find me</span><a href="https://github.com/BuildWithDuke" target="_blank" rel="noreferrer"><Github size={15} /> GitHub</a><a href="https://www.linkedin.com/in/buildwithduke" target="_blank" rel="noreferrer"><Linkedin size={15} /> LinkedIn</a></div>
    </div>
    <div className="shell footer-bottom"><span>© {new Date().getFullYear()} Duke Chijimaka Jonathan</span><span><Link to="/privacy">Privacy</Link> · <Link to="/cookies">Cookies</Link> · <Link to="/terms">Terms</Link></span><Link to="/about">// built with agentic AI-assisted development</Link></div>
  </footer>;
}

export function TerminalWindow({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <article className={`terminal-window ${className}`}><div className="terminal-bar"><span className="window-dots"><i /><i /><i /></span><span>{label}</span></div>{children}</article>;
}

export function SectionHead({ label, title, copy }: { label: string; title: string; copy?: string }) {
  return <div className="section-head"><span className="kicker">{label}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>;
}

export function ProjectVisual({ image, title }: { image: string; title: string }) {
  return <div className="project-visual"><img src={image} alt={`${title} website preview`} loading="lazy" /><span className="visual-scan" /></div>;
}

export function FAQ({ items }: { items: string[][] }) {
  return <div className="faq-list">{items.map(([q, a], i) => <details key={q} open={i === 0}><summary><span><em>0{i + 1}</em>{q}</span><ChevronDown size={19} /></summary><p>{a}</p></details>)}</div>;
}

type Log = { id: number; text: string; tone?: string };
const boot = ["booting daemon v1.4...", "loading personality.sh", "checking signal... online", "hello. type 'help' to begin."];

function Daemon() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [logs, setLogs] = useState<Log[]>([]);
  const [command, setCommand] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const logId = useRef(10);
  const logEnd = useRef<HTMLDivElement>(null);
  const addLog = (text: string, tone?: string) => setLogs(old => [...old.slice(-10), { id: logId.current++, text, tone }]);

  useEffect(() => {
    setLogs([]);
    const timers = boot.map((text, i) => window.setTimeout(() => setLogs(old => [...old, { id: i, text, tone: i === 3 ? "green" : undefined }]), 350 + i * 430));
    return () => timers.forEach(clearTimeout);
  }, []);
  useEffect(() => { if (logs.length) logEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);
  useEffect(() => {
    if (logs.length < 4) return;
    addLog(`route mounted: ${location.pathname}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
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

  const run = (event: FormEvent) => {
    event.preventDefault();
    const value = command.trim().toLowerCase();
    if (!value) return;
    addLog(`$ ${value}`, "blue"); setCommand("");
    const replies: Record<string, string> = {
      help: "commands: whoami · projects · services · pricing · contact · coffee · sudo hire-duke",
      whoami: "Duke. Full-stack developer, automation specialist, systems enjoyer.",
      coffee: "status: dangerously well-caffeinated.",
    };
    if (replies[value]) addLog(replies[value], "green");
    else if (["projects", "services", "pricing", "contact"].includes(value)) { addLog(`opening /${value}...`, "green"); window.setTimeout(() => navigate(`/${value}`), 350); }
    else if (value === "sudo hire-duke") { addLog("permission granted. good decision.", "green"); window.setTimeout(() => navigate("/contact?intent=hire"), 400); }
    else addLog(`command not found: ${value}. try 'help'.`);
  };
  if (dismissed) return <button className="daemon-orb" onClick={() => { setDismissed(false); setOpen(true); }} aria-label="Open DAEMON terminal"><Terminal size={20} /></button>;
  return <aside className={open ? "daemon open" : "daemon"} aria-label="DAEMON interactive terminal">
    <button className="daemon-mobile-trigger" onClick={() => setOpen(true)}><Terminal size={18} /> <span>DAEMON</span><i>online</i></button>
    <div className="daemon-panel">
      <div className="daemon-bar"><span className="window-dots"><i /><i /><i /></span><strong>DAEMON — zsh</strong><button onClick={() => setDismissed(true)} aria-label="Dismiss terminal"><X size={15} /></button></div>
      <div className="daemon-logs" aria-live="polite">{logs.map(log => <div className={log.tone || ""} key={log.id}><span>›</span> {log.text}</div>)}<div ref={logEnd} /></div>
      <form className="daemon-input" onSubmit={run}><label htmlFor="daemon-command">$</label><input id="daemon-command" value={command} onChange={e => setCommand(e.target.value)} placeholder="type a command" autoComplete="off" /><button aria-label="Run command"><Send size={15} /></button></form>
      <button className="daemon-close-mobile" onClick={() => setOpen(false)}>Close terminal</button>
    </div>
  </aside>;
}

function CookieConsent() {
  const [mode, setMode] = useState<"hidden" | "main" | "manage">(() => localStorage.getItem("cookie-choice") ? "hidden" : "main");
  const [analytics, setAnalytics] = useState(false);
  const choose = (value: string) => { localStorage.setItem("cookie-choice", value); setMode("hidden"); };
  if (mode === "hidden") return null;
  return <aside className="cookie-panel" aria-label="Cookie preferences">
    <div className="cookie-icon"><Cookie size={21} /></div>
    <div><strong>{mode === "manage" ? "Choose what runs" : "A few useful cookies"}</strong>{mode === "main" ? <p>Necessary storage keeps this site working. Analytics is optional, off until you say yes. Nothing creepy.</p> : <div className="cookie-options"><label><span>Necessary <small>Always on</small></span><input type="checkbox" checked disabled /></label><label><span>Analytics <small>Anonymous usage</small></span><input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} /></label></div>}</div>
    <div className="cookie-actions">{mode === "main" ? <><button className="button button-primary" onClick={() => choose("all")}>Accept all</button><button className="button button-ghost" onClick={() => choose("necessary")}>Necessary only</button><button className="text-button" onClick={() => setMode("manage")}>Manage</button></> : <button className="button button-primary" onClick={() => choose(analytics ? "analytics" : "necessary")}><Check size={16} /> Save choices</button>}</div>
  </aside>;
}

export function WhatsAppLink({ children = "Message on WhatsApp", className = "button button-secondary" }: { children?: ReactNode; className?: string }) {
  return <a className={className} href={WA_URL} target="_blank" rel="noreferrer"><MessageCircle size={17} />{children}</a>;
}
