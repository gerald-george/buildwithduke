import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { ArrowRight, Database, Download, LockKeyhole, LogOut, Plus, RefreshCw, Save, Trash2, Upload } from "lucide-react";
import { IconBox, TerminalWindow } from "./components";

type Module = "projects" | "testimonials" | "pricing" | "leads" | "commands" | "posts" | "settings";
type Row = Record<string, unknown>;

const modules: Array<{ key: Module; label: string; copy: string }> = [
  { key: "projects", label: "Projects", copy: "Case studies, screenshots and featured work" },
  { key: "testimonials", label: "Testimonials", copy: "Real client feedback and ordering" },
  { key: "pricing", label: "Pricing", copy: "Packages, features and popularity" },
  { key: "leads", label: "Leads", copy: "Enquiries, status and CSV export" },
  { key: "commands", label: "DAEMON", copy: "Terminal commands and live actions" },
  { key: "posts", label: "Build log", copy: "Draft and published articles" },
  { key: "settings", label: "Settings", copy: "Public business details" },
];

const templates: Record<Module, Row> = {
  projects: { slug: "", title: "", eyebrow: "", description: "", problem: "", solution: "", result: "", stack: "[]", screenshot_r2_keys: "[]", live_url: "", demo_flag: 0, category: "Web development", featured: 0, sort_order: 0 },
  testimonials: { author_name: "", author_role: "", company: "", quote: "", sort_order: 0 },
  pricing: { name: "", price_gbp: 0, description: "", features: "[]", is_popular: 0, sort_order: 0 },
  leads: { status: "new" },
  commands: { command: "", response_text: "", action_type: "text", action_target: "", is_active: 1 },
  posts: { slug: "", title: "", excerpt: "", body: "", status: "draft", published_at: null },
  settings: { key: "", value: "" },
};

export default function Admin() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [csrf, setCsrf] = useState("");
  const [module, setModule] = useState<Module>("projects");
  const [rows, setRows] = useState<Row[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const request = useCallback(async (url: string, init: RequestInit = {}) => {
    const response = await fetch(url, { ...init, headers: { "content-type": "application/json", ...(csrf ? { "x-csrf-token": csrf } : {}), ...init.headers } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || "The admin request failed.");
    return body;
  }, [csrf]);

  const load = useCallback(async (next = module) => {
    setBusy(true); setStatus("");
    try { const body = await request(`/api/admin/data?module=${next}`); setRows(body.rows || []); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Could not load data."); }
    finally { setBusy(false); }
  }, [module, request]);

  useEffect(() => {
    fetch("/api/admin/session").then(async response => {
      if (!response.ok) throw new Error();
      const body = await response.json(); setCsrf(body.csrf); setAuthenticated(true);
    }).catch(() => setAuthenticated(false));
  }, []);
  useEffect(() => { if (authenticated) load(module); }, [authenticated, module, load]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setStatus("");
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    try { const body = await request("/api/admin/login", { method: "POST", body: JSON.stringify(payload) }); setCsrf(body.csrf); setAuthenticated(true); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Sign-in failed."); }
    finally { setBusy(false); }
  };

  const openEditor = (row?: Row) => {
    const next = row || templates[module]; setEditing(next); setDraft(JSON.stringify(next, null, 2)); setStatus("");
  };
  const save = async () => {
    let value: Row;
    try { value = JSON.parse(draft) as Row; } catch { setStatus("The record must be valid JSON."); return; }
    setBusy(true);
    try {
      await request("/api/admin/data", { method: value.id ? "PUT" : "POST", body: JSON.stringify({ module, record: value }) });
      setEditing(null); setStatus("Saved. Public content refreshes within five minutes."); await load();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Save failed."); }
    finally { setBusy(false); }
  };
  const uploadMedia = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true); setStatus("");
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", headers: { "x-csrf-token": csrf }, body: form });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Upload failed.");
      const record = JSON.parse(draft) as Row; record.image = body.url;
      setDraft(JSON.stringify(record, null, 2)); setStatus("Uploaded. Save the record to publish this media URL.");
    } catch (error) { setStatus(error instanceof Error ? error.message : "Upload failed."); }
    finally { setBusy(false); event.target.value = ""; }
  };
  const remove = async (row: Row) => {
    if (!window.confirm("Delete this record? This cannot be undone.")) return;
    setBusy(true);
    try { await request("/api/admin/data", { method: "DELETE", body: JSON.stringify({ module, id: row.id }) }); await load(); }
    catch (error) { setStatus(error instanceof Error ? error.message : "Delete failed."); }
    finally { setBusy(false); }
  };
  const logout = async () => { await request("/api/admin/logout", { method: "POST", body: "{}" }).catch(() => undefined); setAuthenticated(false); setCsrf(""); };
  const exportLeads = () => {
    const keys = ["name", "email", "company", "project_type", "budget_range", "message", "status", "created_at"];
    const csv = [keys.join(","), ...rows.map(row => keys.map(key => `"${String(row[key] ?? "").replaceAll('"', '""')}"`).join(","))].join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = `buildwithduke-leads-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };

  if (authenticated === null) return <section className="admin-page"><span className="kicker">Verifying secure session…</span></section>;
  if (!authenticated) return <section className="admin-page"><TerminalWindow label="admin@buildwithduke — secure"><form className="admin-login" onSubmit={login}><IconBox><LockKeyhole /></IconBox><span className="kicker">Restricted route</span><h1>Admin console</h1><p>Sign in with the private credentials configured in Cloudflare. Sessions are signed, short-lived and protected against cross-site requests.</p><label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" required minLength={12} /></label><button className="button button-primary" disabled={busy}>{busy ? "Checking…" : <>Open control room <ArrowRight size={16} /></>}</button>{status && <p className="form-status error" role="alert">{status}</p>}</form></TerminalWindow></section>;

  const current = modules.find(item => item.key === module)!;
  return <section className="admin-dashboard"><div className="shell"><div className="admin-title"><div><span className="kicker">Authenticated workspace</span><h1>Control room</h1></div><button className="button button-ghost" onClick={logout}><LogOut size={16} /> Sign out</button></div>
    <div className="admin-layout"><nav className="admin-modules" aria-label="Admin modules">{modules.map(item => <button className={module === item.key ? "active" : ""} key={item.key} onClick={() => { setModule(item.key); setEditing(null); }}><span>{item.label}</span><small>{item.copy}</small></button>)}</nav>
      <div className="admin-workspace"><div className="admin-toolbar"><div><span className="kicker">{current.label}</span><h2>{rows.length} record{rows.length === 1 ? "" : "s"}</h2></div><div>{module === "leads" && <button className="button button-ghost" onClick={exportLeads}><Download size={16} /> CSV</button>}<button className="button button-ghost" onClick={() => load()} disabled={busy}><RefreshCw size={16} /> Refresh</button>{module !== "leads" && <button className="button button-primary" onClick={() => openEditor()}><Plus size={16} /> Add</button>}</div></div>
        {status && <p className="admin-status" role="status">{status}</p>}
        {editing ? <TerminalWindow label={`editor/${module}`}><div className="admin-editor"><p>Edit the structured record below. Arrays such as features and stack are stored as JSON strings, for example <code>[&quot;React&quot;,&quot;Cloudflare&quot;]</code>.</p>{module === "projects" && <label className="admin-upload"><Upload size={17} /><span>Upload project media<small>JPG, PNG, WebP or AVIF · 8 MB maximum</small></span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={uploadMedia} disabled={busy} /></label>}<textarea aria-label="Record JSON" value={draft} onChange={event => setDraft(event.target.value)} spellCheck={false} /><div className="button-row"><button className="button button-primary" onClick={save} disabled={busy}><Save size={16} /> Save record</button><button className="button button-ghost" onClick={() => setEditing(null)}>Cancel</button></div></div></TerminalWindow> : <div className="admin-table">{busy && rows.length === 0 ? <div className="empty-state"><Database /><h2>Loading records…</h2></div> : rows.length === 0 ? <div className="empty-state"><Database /><h2>No records yet.</h2><p>Add the first record or keep using the site’s production-safe static fallback content.</p></div> : rows.map(row => <article key={String(row.id ?? row.key)}><div><strong>{String(row.title ?? row.name ?? row.author_name ?? row.command ?? row.email ?? row.key ?? "Record")}</strong><span>{String(row.description ?? row.quote ?? row.message ?? row.value ?? row.status ?? "").slice(0, 150)}</span></div><div><button onClick={() => openEditor(row)}>Edit</button>{module !== "leads" && <button className="danger" onClick={() => remove(row)} aria-label="Delete record"><Trash2 size={15} /></button>}</div></article>)}</div>}
      </div></div>
    <div className="admin-production-note"><Upload /><div><strong>R2 media and private payment instructions</strong><p>Project media is uploaded through the configured R2 binding. Bank transfer is the only payment method currently available; payment details are shared privately in accepted quotes or invoices and are never exposed here.</p></div></div>
  </div></section>;
}
