import { ChangeEvent, Dispatch, FormEvent, ReactNode, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, ArrowLeft, ArrowRight, BarChart3, BookOpen, Bot, BriefcaseBusiness, Cable, Check, CheckCircle2,
  ChevronRight, CircleDollarSign, Clock3, Command, Copy, Database, Download, ExternalLink, FileText, Image as ImageIcon,
  LayoutDashboard, LockKeyhole, LogOut, Mail, MessageSquareQuote, Play, Plus, RefreshCw, Save, Search,
  Settings2, ShieldCheck, SlidersHorizontal, Tag, Trash2, Upload, Users, X,
} from "lucide-react";
import { IconBox, TerminalWindow } from "./components";
import AdminRichTextEditor from "./AdminRichTextEditor";

type DataModule = "projects" | "testimonials" | "pricing" | "leads" | "commands" | "posts" | "settings";
type SpecialModule = "integrations" | "automation";
type Module = "overview" | DataModule | SpecialModule;
type Row = Record<string, unknown>;
type AdminRequest = (url: string, init?: RequestInit) => Promise<Record<string, any>>;
type FieldType = "text" | "email" | "url" | "textarea" | "number" | "select" | "toggle" | "tags" | "keyvalue" | "datetime" | "richtext" | "media" | "readonly" | "setting-value";
type Field = {
  key: string; label: string; type: FieldType; group: string; help?: string; placeholder?: string; required?: boolean;
  options?: Array<{ label: string; value: string }>; rows?: number; min?: number; max?: number; accept?: string;
};
type Overview = {
  counts: Partial<Record<DataModule, number>>; newLeads: number; draftPosts: number; publishedPosts: number; recentLeads: Row[];
};
type NotificationStatus = { configured: boolean; provider?: string; replyMailbox?: string };
type AutoblogData = { settings: Row | null; runs: Row[]; configured: { openrouter: boolean; serpapi: boolean; scheduler: boolean } };

const dataModules: DataModule[] = ["projects", "testimonials", "pricing", "leads", "commands", "posts", "settings"];
const emptyRecords = (): Record<DataModule, Row[]> => ({ projects: [], testimonials: [], pricing: [], leads: [], commands: [], posts: [], settings: [] });

const modules: Array<{ key: Module; label: string; copy: string; icon: typeof LayoutDashboard }> = [
  { key: "overview", label: "Overview", copy: "Activity and content health", icon: LayoutDashboard },
  { key: "projects", label: "Projects", copy: "Case studies and featured work", icon: BriefcaseBusiness },
  { key: "testimonials", label: "Testimonials", copy: "Client feedback and ordering", icon: MessageSquareQuote },
  { key: "pricing", label: "Pricing", copy: "Packages, features and priority", icon: CircleDollarSign },
  { key: "leads", label: "Leads", copy: "Enquiries and sales status", icon: Users },
  { key: "posts", label: "Articles", copy: "Build log drafts and publishing", icon: BookOpen },
  { key: "automation", label: "Autoblog", copy: "Research, cadence and originality", icon: Bot },
  { key: "integrations", label: "Notifications", copy: "Free Gmail alerts and Outlook replies", icon: Cable },
  { key: "commands", label: "DAEMON", copy: "Terminal commands and actions", icon: Command },
  { key: "settings", label: "Settings", copy: "Public business details", icon: Settings2 },
];

const templates: Record<DataModule, Row> = {
  projects: { slug: "", title: "", eyebrow: "", description: "", problem: "", solution: "", result: "", stack: "[]", result_metrics: "{}", screenshot_r2_keys: "[]", image: "", live_url: "", demo_flag: 0, demo_note: "", category: "Web development", featured: 0, sort_order: 0 },
  testimonials: { author_name: "", author_role: "", company: "", quote: "", sort_order: 0 },
  pricing: { name: "", price_gbp: 0, description: "", features: "[]", is_popular: 0, sort_order: 0 },
  leads: { status: "new" },
  commands: { command: "", response_text: "", action_type: "text", action_target: "", is_active: 1 },
  posts: { slug: "", title: "", excerpt: "", seo_title: "", meta_description: "", focus_keyword: "", source_urls: "[]", body: "", status: "draft", published_at: null },
  settings: { key: "contact_email", value: "" },
};

const categoryOptions = ["Web development", "AI automation", "Software"].map(value => ({ value, label: value }));
const statusOptions = ["new", "contacted", "quoted", "won", "lost"].map(value => ({ value, label: value[0].toUpperCase() + value.slice(1) }));
const postStatusOptions = [{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }];
const actionOptions = [
  { value: "text", label: "Text response" }, { value: "navigate", label: "Open an internal page" },
  { value: "link", label: "Open an external link" }, { value: "theme", label: "Change colour theme" },
];

const settingDefinitions = [
  { value: "business_name", label: "Business name", type: "text" },
  { value: "contact_email", label: "Contact email", type: "email" },
  { value: "phone_number", label: "Telephone number", type: "text" },
  { value: "phone_display", label: "Displayed telephone number", type: "text" },
  { value: "whatsapp_number", label: "WhatsApp number", type: "text" },
  { value: "service_area", label: "Service area", type: "text" },
  { value: "response_time", label: "Response-time promise", type: "text" },
  { value: "github_url", label: "GitHub URL", type: "url" },
  { value: "instagram_url", label: "Instagram URL", type: "url" },
  { value: "linkedin_url", label: "LinkedIn URL", type: "url" },
  { value: "accepting_projects", label: "Accepting new projects", type: "toggle" },
] as const;

const fields: Record<DataModule, Field[]> = {
  projects: [
    { key: "title", label: "Project title", type: "text", group: "Essentials", required: true, placeholder: "e.g. EventStreamHD" },
    { key: "slug", label: "URL slug", type: "text", group: "Essentials", required: true, help: "Lowercase letters, numbers and hyphens only." },
    { key: "eyebrow", label: "Short label", type: "text", group: "Essentials", placeholder: "e.g. Streaming platform · Live" },
    { key: "category", label: "Category", type: "select", group: "Essentials", required: true, options: categoryOptions },
    { key: "description", label: "Card description", type: "textarea", group: "Case study", required: true, rows: 3 },
    { key: "problem", label: "The problem", type: "textarea", group: "Case study", rows: 4 },
    { key: "solution", label: "The solution", type: "textarea", group: "Case study", rows: 4 },
    { key: "result", label: "The result", type: "textarea", group: "Case study", rows: 4 },
    { key: "result_metrics", label: "Result metrics", type: "keyvalue", group: "Case study", help: "Add a label and value for each measurable outcome." },
    { key: "stack", label: "Technology stack", type: "tags", group: "Technology", placeholder: "Type a technology and press Enter" },
    { key: "image", label: "Primary project image", type: "media", group: "Media", accept: "image/jpeg,image/png,image/webp,image/avif" },
    { key: "screenshot_r2_keys", label: "Gallery images", type: "tags", group: "Media", help: "Add existing R2 keys or media URLs. Primary-image uploads are handled above." },
    { key: "live_url", label: "Live project URL", type: "url", group: "Links and visibility", placeholder: "https://…" },
    { key: "demo_flag", label: "This is a mockup", type: "toggle", group: "Links and visibility", help: "Clearly labels non-production work on the public site." },
    { key: "demo_note", label: "Mockup note", type: "text", group: "Links and visibility" },
    { key: "featured", label: "Feature this project", type: "toggle", group: "Publishing" },
    { key: "sort_order", label: "Display order", type: "number", group: "Publishing", min: 0, help: "Lower numbers appear first within the same featured group." },
  ],
  testimonials: [
    { key: "author_name", label: "Client name", type: "text", group: "Testimonial", required: true },
    { key: "author_role", label: "Role", type: "text", group: "Testimonial" },
    { key: "company", label: "Company", type: "text", group: "Testimonial" },
    { key: "quote", label: "Testimonial", type: "textarea", group: "Testimonial", required: true, rows: 6 },
    { key: "sort_order", label: "Display order", type: "number", group: "Publishing", min: 0 },
  ],
  pricing: [
    { key: "name", label: "Package name", type: "text", group: "Package", required: true },
    { key: "price_gbp", label: "Starting price (GBP)", type: "number", group: "Package", min: 0, help: "Leave empty for a custom quote." },
    { key: "description", label: "Short description", type: "textarea", group: "Package", required: true, rows: 3 },
    { key: "features", label: "Included features", type: "tags", group: "Package", required: true, placeholder: "Type a feature and press Enter" },
    { key: "is_popular", label: "Mark as most popular", type: "toggle", group: "Publishing" },
    { key: "sort_order", label: "Display order", type: "number", group: "Publishing", min: 0 },
  ],
  leads: [
    { key: "name", label: "Name", type: "readonly", group: "Contact" },
    { key: "email", label: "Email", type: "readonly", group: "Contact" },
    { key: "company", label: "Company", type: "readonly", group: "Contact" },
    { key: "project_type", label: "Project type", type: "readonly", group: "Enquiry" },
    { key: "budget_range", label: "Budget range", type: "readonly", group: "Enquiry" },
    { key: "message", label: "Message", type: "readonly", group: "Enquiry" },
    { key: "created_at", label: "Received", type: "readonly", group: "Enquiry" },
    { key: "status", label: "Sales status", type: "select", group: "Workflow", options: statusOptions, required: true },
  ],
  commands: [
    { key: "command", label: "Command", type: "text", group: "Command", required: true, placeholder: "e.g. availability" },
    { key: "response_text", label: "Terminal response", type: "textarea", group: "Command", required: true, rows: 5 },
    { key: "action_type", label: "Action", type: "select", group: "Behaviour", options: actionOptions },
    { key: "action_target", label: "Action target", type: "text", group: "Behaviour", help: "A route, URL or theme name depending on the selected action." },
    { key: "is_active", label: "Command is active", type: "toggle", group: "Publishing" },
  ],
  posts: [
    { key: "title", label: "Article title", type: "text", group: "Article details", required: true },
    { key: "slug", label: "URL slug", type: "text", group: "Article details", required: true, help: "Lowercase letters, numbers and hyphens only." },
    { key: "excerpt", label: "Summary", type: "textarea", group: "Article details", rows: 3, help: "Used on the build-log listing and in search previews." },
    { key: "seo_title", label: "SEO title", type: "text", group: "Search appearance", help: "Optional. Aim for 50–60 characters; the article title is the fallback." },
    { key: "meta_description", label: "Meta description", type: "textarea", group: "Search appearance", rows: 2, help: "Optional. Aim for a useful 140–160 character summary." },
    { key: "focus_keyword", label: "Focus phrase", type: "text", group: "Search appearance", help: "A planning aid, never an instruction to stuff keywords." },
    { key: "source_urls", label: "Research sources", type: "tags", group: "Search appearance", placeholder: "Add a source URL and press Enter" },
    { key: "body", label: "Article content", type: "richtext", group: "Content", required: true },
    { key: "status", label: "Publishing status", type: "select", group: "Publishing", options: postStatusOptions },
    { key: "published_at", label: "Publish date and time", type: "datetime", group: "Publishing", help: "Automatically set when publishing if left empty." },
  ],
  settings: [
    { key: "key", label: "Setting", type: "select", group: "Public setting", options: settingDefinitions.map(item => ({ value: item.value, label: item.label })), required: true },
    { key: "value", label: "Value", type: "setting-value", group: "Public setting", required: true },
  ],
};

const asString = (value: unknown) => value == null ? "" : String(value);
const asBoolean = (value: unknown) => value === true || value === 1 || value === "1" || value === "true";
const slugify = (value: string) => value.toLowerCase().trim().replace(/['’]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const parseList = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value !== "string" || !value.trim()) return [];
  try { const parsed = JSON.parse(value); return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : []; } catch { return value.split(",").map(item => item.trim()).filter(Boolean); }
};
const parseMap = (value: unknown): Record<string, string> => {
  if (value && typeof value === "object" && !Array.isArray(value)) return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, asString(entry)]));
  if (typeof value !== "string" || !value.trim()) return {};
  try { const parsed = JSON.parse(value); return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? Object.fromEntries(Object.entries(parsed).map(([key, entry]) => [key, asString(entry)])) : {}; } catch { return {}; }
};

export default function Admin() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [csrf, setCsrf] = useState("");
  const [module, setModule] = useState<Module>("overview");
  const [records, setRecords] = useState<Record<DataModule, Row[]>>(emptyRecords);
  const [overview, setOverview] = useState<Overview>({ counts: {}, newLeads: 0, draftPosts: 0, publishedPosts: 0, recentLeads: [] });
  const [editing, setEditing] = useState<Row | null>(null);
  const [original, setOriginal] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [notice, setNotice] = useState<{ text: string; kind: "success" | "error" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notifications, setNotifications] = useState<NotificationStatus>({ configured: false });
  const [autoblog, setAutoblog] = useState<AutoblogData>({ settings: null, runs: [], configured: { openrouter: false, serpapi: false, scheduler: false } });

  const request = useCallback(async (url: string, init: RequestInit = {}) => {
    const response = await fetch(url, { ...init, headers: { ...(init.body ? { "content-type": "application/json" } : {}), ...(csrf ? { "x-csrf-token": csrf } : {}), ...init.headers } });
    const rawBody = await response.text();
    let body: Record<string, any> = {};
    try { body = rawBody ? JSON.parse(rawBody) as Record<string, any> : {}; } catch { /* Cloudflare may return a plain-text error for an unhandled Function failure. */ }
    if (!response.ok) {
      const fallback = response.status >= 500
        ? `The admin service could not complete this request (HTTP ${response.status}). Check the Pages Function deployment and D1 migrations.`
        : `The admin request was rejected (HTTP ${response.status}).`;
      throw new Error(typeof body.error === "string" && body.error ? body.error : fallback);
    }
    return body;
  }, [csrf]);

  const load = useCallback(async (next: Module, quiet = false) => {
    if (!quiet) setBusy(true);
    try {
      if (next === "integrations") setNotifications(await request("/api/admin/notifications") as NotificationStatus);
      else if (next === "automation") setAutoblog(await request("/api/admin/autoblog") as AutoblogData);
      else {
        const body = await request(`/api/admin/data?module=${next}`);
        if (next === "overview") setOverview(body as Overview);
        else setRecords(current => ({ ...current, [next]: body.rows || [] }));
      }
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : "Could not load data.", kind: "error" });
    } finally { if (!quiet) setBusy(false); }
  }, [request]);

  useEffect(() => {
    fetch("/api/admin/session").then(async response => {
      if (!response.ok) throw new Error();
      const body = await response.json(); setCsrf(body.csrf); setAuthenticated(true);
    }).catch(() => setAuthenticated(false));
  }, []);
  useEffect(() => { if (authenticated) load(module); }, [authenticated, module, load]);
  const dirty = Boolean(editing && JSON.stringify(editing) !== original);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty) event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setNotice(null);
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    try { const body = await request("/api/admin/login", { method: "POST", body: JSON.stringify(payload) }); setCsrf(body.csrf); setAuthenticated(true); }
    catch (error) { setNotice({ text: error instanceof Error ? error.message : "Sign-in failed.", kind: "error" }); }
    finally { setBusy(false); }
  };

  const navigateModule = (next: Module) => {
    if (dirty && !window.confirm("Discard your unsaved changes?")) return;
    setModule(next); setEditing(null); setOriginal(""); setQuery(""); setFilter("all"); setNotice(null);
  };

  const openEditor = (row?: Row) => {
    if (!dataModules.includes(module as DataModule)) return;
    const dataModule = module as DataModule;
    const next = structuredClone(row || templates[dataModule]);
    setEditing(next); setOriginal(JSON.stringify(next)); setNotice(null); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateField = (key: string, value: unknown) => setEditing(current => {
    if (!current) return current;
    const next = { ...current, [key]: value };
    if ((module === "projects" || module === "posts") && key === "title" && !current.id && !asString(current.slug)) next.slug = slugify(asString(value));
    if (module === "settings" && key === "key" && value !== current.key) next.value = settingDefinitions.find(item => item.value === value)?.type === "toggle" ? "true" : "";
    return next;
  });

  const validate = (value: Row) => {
    if (!dataModules.includes(module as DataModule)) return "Nothing to save.";
    const dataModule = module as DataModule;
    const missing = fields[dataModule].find(field => field.required && field.type !== "readonly" && (field.type === "tags" ? !parseList(value[field.key]).length : !asString(value[field.key]).trim()));
    if (missing) return `${missing.label} is required.`;
    if ((module === "projects" || module === "posts") && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(asString(value.slug))) return "Use a lowercase URL slug with letters, numbers and single hyphens.";
    if (module === "settings" && records.settings.some(row => row.key === value.key && row.id !== value.id)) return "That public setting already exists. Edit the existing setting instead.";
    return "";
  };

  const save = async () => {
    if (!editing || !dataModules.includes(module as DataModule)) return;
    const value = { ...editing };
    if (module === "posts" && value.status === "published" && !value.published_at) value.published_at = new Date().toISOString();
    const error = validate(value);
    if (error) { setNotice({ text: error, kind: "error" }); return; }
    setBusy(true); setNotice(null);
    try {
      await request("/api/admin/data", { method: value.id ? "PUT" : "POST", body: JSON.stringify({ module, record: value }) });
      setEditing(null); setOriginal("");
      setNotice({ text: "Saved successfully. Public content refreshes within five minutes.", kind: "success" });
      await Promise.all([load(module, true), load("overview", true)]);
    } catch (saveError) { setNotice({ text: saveError instanceof Error ? saveError.message : "Save failed.", kind: "error" }); }
    finally { setBusy(false); }
  };

  const uploadMedia = async (event: ChangeEvent<HTMLInputElement>, field: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true); setNotice(null);
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", headers: { "x-csrf-token": csrf }, body: form });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Upload failed.");
      updateField(field, body.url);
      setNotice({ text: "Upload complete. Save the record to publish it.", kind: "success" });
    } catch (uploadError) { setNotice({ text: uploadError instanceof Error ? uploadError.message : "Upload failed.", kind: "error" }); }
    finally { setBusy(false); event.target.value = ""; }
  };

  const duplicate = (row: Row) => {
    if (!dataModules.includes(module as DataModule) || module === "leads") return;
    const next = structuredClone(row);
    ["id", "created_at", "published_at"].forEach(key => delete next[key]);
    if ("title" in next) next.title = `${next.title} (copy)`;
    if ("name" in next) next.name = `${next.name} (copy)`;
    if ("slug" in next) next.slug = `${asString(next.slug)}-copy`;
    if (module === "posts") next.status = "draft";
    setEditing(next); setOriginal(JSON.stringify(templates[module as DataModule])); setNotice({ text: "Review the copy, then save it as a new record.", kind: "success" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (row: Row) => {
    if (!dataModules.includes(module as DataModule) || module === "leads") return;
    if (!window.confirm(`Delete “${recordTitle(row)}”? This cannot be undone.`)) return;
    setBusy(true); setNotice(null);
    try {
      await request("/api/admin/data", { method: "DELETE", body: JSON.stringify({ module, id: row.id }) });
      setNotice({ text: "Record deleted.", kind: "success" }); await Promise.all([load(module, true), load("overview", true)]);
    } catch (deleteError) { setNotice({ text: deleteError instanceof Error ? deleteError.message : "Delete failed.", kind: "error" }); }
    finally { setBusy(false); }
  };

  const logout = async () => {
    if (dirty && !window.confirm("Sign out and discard your unsaved changes?")) return;
    await request("/api/admin/logout", { method: "POST", body: "{}" }).catch(() => undefined);
    setAuthenticated(false); setCsrf(""); setEditing(null);
  };

  const rows = dataModules.includes(module as DataModule) ? records[module as DataModule] : [];
  const filteredRows = useMemo(() => rows.filter(row => {
    const haystack = Object.values(row).map(asString).join(" ").toLowerCase();
    const matchesQuery = !query || haystack.includes(query.toLowerCase());
    const matchesFilter = filter === "all" || (module === "leads" || module === "posts" ? row.status === filter : module === "projects" ? row.category === filter : true);
    return matchesQuery && matchesFilter;
  }), [filter, module, query, rows]);

  const exportLeads = () => {
    const keys = ["name", "email", "company", "project_type", "budget_range", "message", "status", "created_at"];
    const csv = [keys.join(","), ...filteredRows.map(row => keys.map(key => `"${asString(row[key]).replaceAll('"', '""')}"`).join(","))].join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = `buildwithduke-leads-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };

  if (authenticated === null) return <section className="admin-page"><span className="kicker">Verifying secure session…</span></section>;
  if (!authenticated) return <section className="admin-page"><TerminalWindow label="admin@buildwithduke — secure"><form className="admin-login" onSubmit={login}><IconBox><LockKeyhole /></IconBox><span className="kicker">Restricted route</span><h1>Admin console</h1><p>Sign in with the private credentials configured in Cloudflare. Sessions are signed, short-lived and protected against cross-site requests.</p><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required minLength={12} /></label><button className="button button-primary" disabled={busy}>{busy ? "Checking…" : <>Open workspace <ArrowRight size={16} /></>}</button>{notice && <p className="form-status error" role="alert">{notice.text}</p>}</form></TerminalWindow></section>;

  const current = modules.find(item => item.key === module)!;
  return <section className="admin-dashboard"><div className="admin-shell">
    <header className="admin-title"><div><span className="kicker">Secure content workspace</span><h1>Build With Duke</h1><p>Manage the portfolio, publishing and enquiries from one place.</p></div><div className="admin-title-actions"><a className="button button-ghost" href="/" target="_blank" rel="noreferrer">View site <ExternalLink size={16} /></a><button className="button button-ghost" onClick={logout}><LogOut size={16} /> Sign out</button></div></header>
    <div className="admin-layout"><nav className="admin-modules" aria-label="Admin modules">{modules.map(item => { const ModuleIcon = item.icon; const isData = dataModules.includes(item.key as DataModule); return <button className={module === item.key ? "active" : ""} key={item.key} onClick={() => navigateModule(item.key)}><ModuleIcon size={17} /><span><strong>{item.label}</strong><small>{item.copy}</small></span>{isData && <em>{overview.counts[item.key as DataModule] ?? records[item.key as DataModule].length}</em>}</button>; })}</nav>
      <main className="admin-workspace">
        <div className="admin-toolbar"><div>{editing && <button className="admin-back" onClick={() => navigateModule(module)}><ArrowLeft size={15} /> Back to {current.label.toLowerCase()}</button>}<span className="kicker">{editing ? `${editing.id ? "Edit" : "Create"} ${singular(module)}` : current.label}</span><h2>{editing ? recordTitle(editing) || `New ${singular(module)}` : module === "overview" ? "Workspace overview" : module === "automation" ? "Scheduled editorial engine" : module === "integrations" ? "Connected services" : `${rows.length} record${rows.length === 1 ? "" : "s"}`}</h2>{!editing && <p>{current.copy}</p>}</div>{!editing && <div>{module === "leads" && <button className="button button-ghost" onClick={exportLeads}><Download size={16} /> Export CSV</button>}<button className="button button-ghost" onClick={() => load(module)} disabled={busy}><RefreshCw className={busy ? "spin" : ""} size={16} /> Refresh</button>{dataModules.includes(module as DataModule) && module !== "leads" && <button className="button button-primary" onClick={() => openEditor()}><Plus size={16} /> Add {singular(module)}</button>}</div>}</div>
        {notice && <div className={`admin-notice ${notice.kind}`} role={notice.kind === "error" ? "alert" : "status"}>{notice.kind === "success" ? <CheckCircle2 size={18} /> : <X size={18} />}<span>{notice.text}</span><button onClick={() => setNotice(null)} aria-label="Dismiss message"><X size={15} /></button></div>}
        {module === "overview" ? <OverviewPanel data={overview} onOpen={navigateModule} /> : module === "integrations" ? <NotificationPanel data={notifications} /> : module === "automation" ? <AutoblogPanel data={autoblog} setData={setAutoblog} request={request} onReload={() => load("automation", true)} setNotice={setNotice} /> : editing ? <RecordEditor module={module as DataModule} record={editing} busy={busy} onChange={updateField} onUpload={uploadMedia} onSave={save} onCancel={() => navigateModule(module)} /> : <>
          <div className="admin-list-tools"><label><Search size={16} /><input value={query} onChange={event => setQuery(event.target.value)} placeholder={`Search ${current.label.toLowerCase()}…`} aria-label={`Search ${current.label}`} />{query && <button onClick={() => setQuery("")} aria-label="Clear search"><X size={14} /></button>}</label>{filterOptions(module) && <label className="admin-filter"><SlidersHorizontal size={15} /><select value={filter} onChange={event => setFilter(event.target.value)} aria-label="Filter records">{filterOptions(module)!.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>}</div>
          <RecordList module={module as DataModule} rows={filteredRows} loading={busy && rows.length === 0} query={query} onEdit={openEditor} onDuplicate={duplicate} onDelete={remove} />
        </>}
      </main>
    </div>
  </div></section>;
}

function OverviewPanel({ data, onOpen }: { data: Overview; onOpen: (module: Module) => void }) {
  const cards = [
    { label: "New leads", value: data.newLeads, copy: "Waiting for a first response", icon: Users, target: "leads" as Module },
    { label: "Published articles", value: data.publishedPosts, copy: `${data.draftPosts} draft${data.draftPosts === 1 ? "" : "s"} in progress`, icon: BookOpen, target: "posts" as Module },
    { label: "Projects", value: data.counts.projects || 0, copy: "Case studies in the portfolio", icon: BriefcaseBusiness, target: "projects" as Module },
    { label: "Active commands", value: data.counts.commands || 0, copy: "Custom DAEMON responses", icon: Command, target: "commands" as Module },
  ];
  return <div className="admin-overview"><div className="admin-stat-grid">{cards.map(card => { const CardIcon = card.icon; return <button key={card.label} onClick={() => onOpen(card.target)}><span><CardIcon size={18} />{card.label}</span><strong>{card.value}</strong><small>{card.copy}</small><ChevronRight size={17} /></button>; })}</div>
    <section className="admin-panel"><div className="admin-panel-head"><div><span className="kicker">Pipeline</span><h3>Recent enquiries</h3></div><button onClick={() => onOpen("leads")}>View all <ArrowRight size={15} /></button></div>{data.recentLeads.length ? <div className="admin-recent-leads">{data.recentLeads.map(lead => <button key={asString(lead.id)} onClick={() => onOpen("leads")}><span className="lead-avatar">{asString(lead.name).slice(0, 1).toUpperCase()}</span><span><strong>{asString(lead.name)}</strong><small>{asString(lead.project_type) || "General enquiry"} · {formatDate(lead.created_at)}</small></span><StatusBadge value={asString(lead.status)} /></button>)}</div> : <div className="admin-empty-compact"><Mail /><span><strong>No enquiries yet</strong><small>New contact-form submissions will appear here.</small></span></div>}</section>
    <section className="admin-panel admin-health"><div className="admin-panel-head"><div><span className="kicker">Content health</span><h3>Workspace at a glance</h3></div><BarChart3 /></div><div>{dataModules.map(key => <button key={key} onClick={() => onOpen(key)}><span>{modules.find(item => item.key === key)?.label}</span><strong>{data.counts[key] || 0}</strong></button>)}</div></section>
  </div>;
}

function RecordList({ module, rows, loading, query, onEdit, onDuplicate, onDelete }: { module: DataModule; rows: Row[]; loading: boolean; query: string; onEdit: (row: Row) => void; onDuplicate: (row: Row) => void; onDelete: (row: Row) => void }) {
  if (loading) return <div className="admin-empty"><RefreshCw className="spin" /><h3>Loading records…</h3></div>;
  if (!rows.length) return <div className="admin-empty"><Database /><h3>{query ? "No matching records" : `No ${modules.find(item => item.key === module)?.label.toLowerCase()} yet`}</h3><p>{query ? "Try a different search term or filter." : module === "leads" ? "New contact-form enquiries will appear here." : "Create the first record when you are ready."}</p></div>;
  return <div className="admin-records">{rows.map(row => <article key={asString(row.id || row.key)}>
    {module === "projects" && asString(row.image) ? <img src={asString(row.image)} alt="" /> : <span className="admin-record-icon">{recordIcon(module)}</span>}
    <button className="admin-record-main" onClick={() => onEdit(row)}><span className="admin-record-title"><strong>{recordTitle(row)}</strong>{recordBadge(module, row)}</span><span>{recordDescription(module, row)}</span><small>{recordMeta(module, row)}</small></button>
    <div className="admin-record-actions"><button onClick={() => onEdit(row)} aria-label={`Edit ${recordTitle(row)}`}>Edit</button>{module !== "leads" && <button title="Duplicate" onClick={() => onDuplicate(row)} aria-label={`Duplicate ${recordTitle(row)}`}><Copy size={15} /></button>}{module !== "leads" && <button className="danger" title="Delete" onClick={() => onDelete(row)} aria-label={`Delete ${recordTitle(row)}`}><Trash2 size={15} /></button>}</div>
  </article>)}</div>;
}

function RecordEditor({ module, record, busy, onChange, onUpload, onSave, onCancel }: { module: DataModule; record: Row; busy: boolean; onChange: (key: string, value: unknown) => void; onUpload: (event: ChangeEvent<HTMLInputElement>, field: string) => void; onSave: () => void; onCancel: () => void }) {
  const groups = [...new Set(fields[module].map(field => field.group))];
  const replyHref = `mailto:${encodeURIComponent(asString(record.email))}?subject=${encodeURIComponent("Re: Your Build With Duke enquiry")}&body=${encodeURIComponent(`Hi ${asString(record.name).split(" ")[0]},\n\nThanks for getting in touch.\n\n— Duke\nBuild With Duke`)}`;
  return <div className="admin-form">{module === "leads" && <div className="lead-contact-actions"><a className="button button-primary" href={replyHref} title="Opens your default mail app; set Outlook as the default to reply from the business account."><Mail size={16} /> Draft reply in Outlook</a>{asString(record.email) && <button className="button button-ghost" onClick={() => navigator.clipboard.writeText(asString(record.email))}><Copy size={15} /> Copy email</button>}</div>}
    {groups.map(group => <section className={`admin-form-section ${group === "Content" ? "wide" : ""}`} key={group}><div className="admin-form-section-head"><h3>{group}</h3><span>{sectionHelp(module, group)}</span></div><div className="admin-fields">{fields[module].filter(field => field.group === group).map(field => <AdminField key={field.key} field={field} value={record[field.key]} record={record} busy={busy} onChange={value => onChange(field.key, value)} onUpload={event => onUpload(event, field.key)} />)}</div></section>)}
    <div className="admin-savebar"><div>{record.id ? <><Check size={17} /><span>Editing an existing {singular(module)}</span></> : <><Plus size={17} /><span>Creating a new {singular(module)}</span></>}</div><div><button className="button button-ghost" onClick={onCancel} disabled={busy}>Cancel</button><button className="button button-primary" onClick={onSave} disabled={busy}><Save size={16} /> {busy ? "Saving…" : module === "leads" ? "Update status" : "Save record"}</button></div></div>
  </div>;
}

function NotificationPanel({ data }: { data: NotificationStatus }) {
  return <div className="integration-grid"><section className="admin-panel integration-card"><div className="integration-brand"><span><Mail /></span><div><span className="kicker">Google Apps Script</span><h3>{data.configured ? "Gmail alerts ready" : "Gmail relay needs setup"}</h3></div><StatusBadge value={data.configured ? "active" : "inactive"} /></div>
    <p>New contact-form enquiries stay in D1 and are privately forwarded to the Gmail account that owns the free Apps Script relay.</p>{!data.configured && <div className="admin-inline-warning"><AlertTriangle size={16} /><span>Add the Apps Script deployment URL and shared relay secret to Cloudflare to enable alerts.</span></div>}
  </section><section className="admin-panel integration-capabilities"><div className="admin-panel-head"><div><span className="kicker">Lead handoff</span><h3>Gmail in, Outlook out</h3></div><ShieldCheck /></div><ul><li><Mail /> One private Gmail alert for each accepted enquiry</li><li><Cable /> No custom domain, paid tenant or mailbox OAuth client</li><li><ShieldCheck /> Shared secret stays server-side in Cloudflare and Apps Script</li><li><ExternalLink /> Lead records open prefilled replies in your Outlook mail app</li></ul></section></div>;
}

function AutoblogPanel({ data, setData, request, onReload, setNotice }: { data: AutoblogData; setData: Dispatch<SetStateAction<AutoblogData>>; request: AdminRequest; onReload: () => Promise<void>; setNotice: (notice: { text: string; kind: "success" | "error" } | null) => void }) {
  const [busy, setBusy] = useState(false);
  const settings = data.settings;
  const update = (key: string, value: unknown) => setData(current => ({ ...current, settings: { ...(current.settings || {}), [key]: value } }));
  const topics = parseList(settings?.topics).join("\n");
  const save = async () => {
    if (!settings) return;
    setBusy(true); setNotice(null);
    try {
      const next = { ...settings, topics: topics.split("\n").map(item => item.trim()).filter(Boolean) };
      await request("/api/admin/autoblog", { method: "PUT", body: JSON.stringify({ settings: next }) }); await onReload();
      setNotice({ text: "Autoblog settings saved. The hourly scheduler will create an article only when it is due.", kind: "success" });
    } catch (error) { setNotice({ text: error instanceof Error ? error.message : "Could not save autoblog settings.", kind: "error" }); }
    finally { setBusy(false); }
  };
  const run = async () => {
    setBusy(true); setNotice(null);
    try { const result = await request("/api/admin/autoblog", { method: "POST", body: "{}" }); await Promise.all([onReload()]); setNotice({ text: result.status === "created" ? `Created “${result.title}” as ${result.publishMode}.` : result.message || "Run complete.", kind: "success" }); }
    catch (error) { await onReload(); setNotice({ text: error instanceof Error ? error.message : "The autoblog run failed.", kind: "error" }); }
    finally { setBusy(false); }
  };
  if (!settings) return <div className="admin-empty"><Bot /><h3>Autoblog migration required</h3><p>Apply migration 0003 before configuring scheduled publishing.</p></div>;
  return <div className="autoblog-layout"><section className="admin-panel autoblog-status"><div className="admin-panel-head"><div><span className="kicker">Readiness</span><h3>Editorial safeguards</h3></div><Bot /></div><div className="integration-status-row"><StatusItem ready={data.configured.openrouter} label="OpenRouter" /><StatusItem ready={data.configured.serpapi} label="SerpApi" /><StatusItem ready={data.configured.scheduler} label="Scheduler" /></div><p>Every run researches current results, creates source-backed original copy, checks it against the latest 100 articles, and respects the monthly cap. Draft review is the safest default.</p></section>
    <section className="admin-panel autoblog-config"><div className="admin-panel-head"><div><span className="kicker">Configuration</span><h3>Cadence and editorial brief</h3></div><button className="button button-ghost" onClick={run} disabled={busy || !data.configured.openrouter || !data.configured.serpapi}><Play size={16} /> Run now</button></div><div className="autoblog-fields">
      <label className="admin-toggle"><span><strong>Scheduled creation</strong><small>The scheduler still enforces cadence and monthly limits.</small></span><input type="checkbox" checked={asBoolean(settings.enabled)} onChange={event => update("enabled", event.target.checked ? 1 : 0)} /><i><span /></i></label>
      <label><span>OpenRouter model</span><input value={asString(settings.model)} onChange={event => update("model", event.target.value)} placeholder="openrouter/free" /></label>
      <label><span>Interval (hours)</span><input type="number" min="6" max="2160" value={asString(settings.interval_hours)} onChange={event => update("interval_hours", Number(event.target.value))} /></label>
      <label><span>Maximum posts per month</span><input type="number" min="1" max="31" value={asString(settings.max_posts_per_month)} onChange={event => update("max_posts_per_month", Number(event.target.value))} /></label>
      <label><span>Minimum article words</span><input type="number" min="600" max="3000" value={asString(settings.min_words)} onChange={event => update("min_words", Number(event.target.value))} /></label>
      <label><span>Similarity rejection threshold</span><input type="number" min="0.35" max="0.85" step="0.01" value={asString(settings.similarity_threshold)} onChange={event => update("similarity_threshold", Number(event.target.value))} /><small>Lower is stricter. 0.58 is a cautious default.</small></label>
      <label><span>Publishing mode</span><select value={asString(settings.publish_mode)} onChange={event => update("publish_mode", event.target.value)}><option value="draft">Create drafts for review</option><option value="published">Publish automatically</option></select></label>
      <label><span>Search country</span><input value={asString(settings.search_country)} maxLength={2} onChange={event => update("search_country", event.target.value.toLowerCase())} /></label>
      <label><span>Search language</span><input value={asString(settings.search_language)} maxLength={2} onChange={event => update("search_language", event.target.value.toLowerCase())} /></label>
      <label className="wide"><span>Topic lanes — one per line</span><textarea rows={6} value={topics} onChange={event => update("topics", JSON.stringify(event.target.value.split("\n")))} /></label>
    </div><div className="autoblog-save"><span>Next due: {settings.next_run_at ? formatDate(settings.next_run_at, true) : "after enabling"}</span><button className="button button-primary" onClick={save} disabled={busy}><Save size={16} /> {busy ? "Working…" : "Save automation"}</button></div></section>
    <section className="admin-panel autoblog-runs"><div className="admin-panel-head"><div><span className="kicker">Audit trail</span><h3>Recent runs</h3></div><RefreshCw /></div>{data.runs.length ? <div>{data.runs.map(runItem => <article key={asString(runItem.id)}><StatusBadge value={asString(runItem.status)} /><span><strong>{asString(runItem.query) || "Scheduled check"}</strong><small>{asString(runItem.message) || "Run in progress"}</small></span><time>{formatDate(runItem.started_at, true)}</time></article>)}</div> : <div className="admin-empty-compact"><Clock3 /><span><strong>No runs yet</strong><small>Use Run now to test the configured pipeline.</small></span></div>}</section>
  </div>;
}

function StatusItem({ ready, label }: { ready: boolean; label: string }) { return <span className={ready ? "ready" : "missing"}>{ready ? <CheckCircle2 /> : <AlertTriangle />}<strong>{label}</strong><small>{ready ? "Ready" : "Secret missing"}</small></span>; }

function AdminField({ field, value, record, busy, onChange, onUpload }: { field: Field; value: unknown; record: Row; busy: boolean; onChange: (value: unknown) => void; onUpload: (event: ChangeEvent<HTMLInputElement>) => void }) {
  const inputId = `admin-${field.key}`;
  if (field.type === "toggle") return <label className="admin-toggle" htmlFor={inputId}><span><strong>{field.label}</strong>{field.help && <small>{field.help}</small>}</span><input id={inputId} type="checkbox" checked={asBoolean(value)} onChange={event => onChange(event.target.checked ? 1 : 0)} disabled={busy} /><i aria-hidden="true"><span /></i></label>;
  if (field.type === "tags") return <FieldShell field={field}><StringListField value={value} placeholder={field.placeholder} onChange={items => onChange(JSON.stringify(items))} /></FieldShell>;
  if (field.type === "keyvalue") return <FieldShell field={field}><KeyValueField value={value} onChange={entries => onChange(JSON.stringify(entries))} /></FieldShell>;
  if (field.type === "richtext") return <FieldShell field={field} wide><AdminRichTextEditor value={asString(value)} onChange={onChange} placeholder="Write the full article here…" disabled={busy} /></FieldShell>;
  if (field.type === "media") return <FieldShell field={field} wide><MediaField value={asString(value)} accept={field.accept} busy={busy} onChange={onChange} onUpload={onUpload} /></FieldShell>;
  if (field.type === "setting-value") return <FieldShell field={field}><SettingValueField settingKey={asString(record.key)} value={asString(value)} onChange={onChange} /></FieldShell>;
  if (field.type === "readonly") return <FieldShell field={field}><div className={`admin-readonly ${field.key === "message" ? "message" : ""}`}>{field.key === "created_at" ? formatDate(value, true) : asString(value) || "—"}</div></FieldShell>;
  if (field.type === "textarea") return <FieldShell field={field}><textarea id={inputId} rows={field.rows || 4} value={asString(value)} placeholder={field.placeholder} required={field.required} onChange={event => onChange(event.target.value)} disabled={busy} /></FieldShell>;
  if (field.type === "select") return <FieldShell field={field}><select id={inputId} value={asString(value)} required={field.required} onChange={event => onChange(event.target.value)} disabled={busy}>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></FieldShell>;
  if (field.type === "datetime") return <FieldShell field={field}><input id={inputId} type="datetime-local" value={toDateTimeLocal(value)} onChange={event => onChange(event.target.value ? new Date(event.target.value).toISOString() : null)} disabled={busy} /></FieldShell>;
  return <FieldShell field={field}><input id={inputId} type={field.type === "number" ? "number" : field.type} value={value == null ? "" : asString(value)} min={field.min} max={field.max} placeholder={field.placeholder} required={field.required} onChange={event => onChange(field.type === "number" ? (event.target.value === "" ? null : Number(event.target.value)) : event.target.value)} disabled={busy} /></FieldShell>;
}

function FieldShell({ field, children, wide = false }: { field: Field; children: ReactNode; wide?: boolean }) {
  return <label className={`admin-field ${wide ? "wide" : ""}`} htmlFor={`admin-${field.key}`}><span>{field.label}{field.required && <em>Required</em>}</span>{children}{field.help && <small>{field.help}</small>}</label>;
}

function StringListField({ value, placeholder, onChange }: { value: unknown; placeholder?: string; onChange: (items: string[]) => void }) {
  const items = parseList(value);
  const [draft, setDraft] = useState("");
  const add = () => { const next = draft.trim(); if (next && !items.includes(next)) onChange([...items, next]); setDraft(""); };
  return <div className="admin-tag-editor"><div>{items.map((item, index) => <span key={`${item}-${index}`}>{item}<button type="button" onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${item}`}><X size={12} /></button></span>)}</div><div><Tag size={15} /><input value={draft} placeholder={placeholder || "Type a value and press Enter"} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); add(); } }} onBlur={add} /></div></div>;
}

function KeyValueField({ value, onChange }: { value: unknown; onChange: (entries: Record<string, string>) => void }) {
  const entries = Object.entries(parseMap(value));
  const update = (index: number, position: "key" | "value", nextValue: string) => {
    const next = entries.map(([key, entry]) => [key, entry] as [string, string]); next[index][position === "key" ? 0 : 1] = nextValue;
    onChange(Object.fromEntries(next.filter(([key]) => key.trim())));
  };
  return <div className="admin-pairs">{entries.map(([key, entry], index) => <div key={`${key}-${index}`}><input aria-label="Metric label" placeholder="Label" value={key} onChange={event => update(index, "key", event.target.value)} /><input aria-label="Metric value" placeholder="Value" value={entry} onChange={event => update(index, "value", event.target.value)} /><button type="button" onClick={() => onChange(Object.fromEntries(entries.filter((_, entryIndex) => entryIndex !== index)))} aria-label="Remove metric"><Trash2 size={14} /></button></div>)}<button type="button" onClick={() => onChange({ ...Object.fromEntries(entries), [`Metric ${entries.length + 1}`]: "" })}><Plus size={14} /> Add metric</button></div>;
}

function MediaField({ value, accept, busy, onChange, onUpload }: { value: string; accept?: string; busy: boolean; onChange: (value: string) => void; onUpload: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return <div className="admin-media-field">{value ? <div className="admin-media-preview"><img src={value} alt="Current project media" /><button type="button" onClick={() => onChange("")}><Trash2 size={15} /> Remove</button></div> : <div className="admin-media-placeholder"><ImageIcon /><span>No project image selected</span></div>}<div className="admin-media-controls"><label className="button button-ghost"><Upload size={16} /> {busy ? "Uploading…" : "Upload image"}<input type="file" accept={accept} onChange={onUpload} disabled={busy} /></label><span>or</span><input aria-label="Media URL" type="url" value={value} placeholder="Paste an image URL" onChange={event => onChange(event.target.value)} /></div><small>JPG, PNG, WebP or AVIF · 8 MB maximum. Uploaded files are stored in R2.</small></div>;
}

function SettingValueField({ settingKey, value, onChange }: { settingKey: string; value: string; onChange: (value: unknown) => void }) {
  const definition = settingDefinitions.find(item => item.value === settingKey) || settingDefinitions[0];
  if (definition.type === "toggle") return <label className="admin-toggle compact"><span><strong>{value === "true" ? "Enabled" : "Disabled"}</strong></span><input type="checkbox" checked={value === "true"} onChange={event => onChange(event.target.checked ? "true" : "false")} /><i aria-hidden="true"><span /></i></label>;
  return <input id="admin-value" type={definition.type} value={value} onChange={event => onChange(event.target.value)} placeholder={definition.type === "url" ? "https://…" : undefined} />;
}

function filterOptions(module: DataModule) {
  if (module === "leads") return [{ value: "all", label: "All statuses" }, ...statusOptions];
  if (module === "posts") return [{ value: "all", label: "All statuses" }, ...postStatusOptions];
  if (module === "projects") return [{ value: "all", label: "All categories" }, ...categoryOptions];
  return null;
}
function singular(module: Module) { return ({ overview: "item", projects: "project", testimonials: "testimonial", pricing: "package", leads: "lead", commands: "command", posts: "article", settings: "setting", integrations: "integration", automation: "automation" } as const)[module]; }
function recordTitle(row: Row) { return asString(row.title || row.name || row.author_name || row.command || row.email || settingDefinitions.find(item => item.value === row.key)?.label || row.key || "Untitled record"); }
function recordDescription(module: DataModule, row: Row) { return asString(module === "leads" ? row.message : module === "posts" ? row.excerpt : module === "settings" ? row.value : row.description || row.quote || row.response_text || "").replace(/<[^>]*>/g, " ").slice(0, 170); }
function recordMeta(module: DataModule, row: Row) {
  if (module === "projects") return `${asString(row.category)} · Order ${asString(row.sort_order || 0)}`;
  if (module === "pricing") return row.price_gbp == null ? "Custom quote" : `£${Number(row.price_gbp).toLocaleString("en-GB")} · Order ${asString(row.sort_order || 0)}`;
  if (module === "leads") return `${asString(row.project_type) || "General enquiry"} · ${formatDate(row.created_at)}`;
  if (module === "posts") return row.published_at ? `Published ${formatDate(row.published_at)}` : "Not published";
  if (module === "testimonials") return [row.author_role, row.company].filter(Boolean).join(" · ") || `Order ${asString(row.sort_order || 0)}`;
  if (module === "commands") return `${asString(row.action_type || "text")} action`;
  return asString(row.key);
}
function recordBadge(module: DataModule, row: Row) {
  if (module === "leads" || module === "posts") return <StatusBadge value={asString(row.status)} />;
  if (module === "projects" && asBoolean(row.featured)) return <StatusBadge value="featured" />;
  if (module === "pricing" && asBoolean(row.is_popular)) return <StatusBadge value="popular" />;
  if (module === "commands") return <StatusBadge value={asBoolean(row.is_active) ? "active" : "inactive"} />;
  return null;
}
function StatusBadge({ value }: { value: string }) { return <span className={`admin-badge status-${value}`}>{value}</span>; }
function recordIcon(module: DataModule) { const Icon = ({ projects: BriefcaseBusiness, testimonials: MessageSquareQuote, pricing: CircleDollarSign, leads: Users, commands: Command, posts: FileText, settings: Settings2 } as const)[module]; return <Icon size={18} />; }
function formatDate(value: unknown, includeTime = false) { const date = new Date(asString(value)); return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}) }); }
function toDateTimeLocal(value: unknown) { const date = new Date(asString(value)); if (Number.isNaN(date.getTime())) return ""; const offset = date.getTimezoneOffset(); return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 16); }
function sectionHelp(module: DataModule, group: string) {
  const key = `${module}:${group}`;
  return ({ "projects:Essentials": "How this project is identified and grouped.", "projects:Case study": "Tell a clear problem-to-outcome story.", "projects:Media": "Choose imagery used across project pages.", "posts:Content": "Format the article exactly as readers will see it.", "posts:Publishing": "Keep it private or schedule its public date.", "leads:Workflow": "Move the enquiry through your sales pipeline.", "settings:Public setting": "Only approved public business details are available here." } as Record<string, string>)[key] || "Complete the fields below.";
}
