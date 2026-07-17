interface Env {
  DB?: D1Database;
  CACHE?: KVNamespace;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
  CONTACT_FROM_EMAIL?: string;
}

type ContactBody = {
  name?: string;
  email?: string;
  company?: string;
  projectType?: string;
  budget?: string;
  message?: string;
  consent?: string;
  website?: string;
  turnstileToken?: string;
  "cf-turnstile-response"?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (request.headers.get("Sec-Fetch-Site") === "cross-site") return Response.json({ error: "Cross-site requests are not accepted." }, { status: 403 });
  if (Number(request.headers.get("Content-Length") || 0) > 12000) return Response.json({ error: "The enquiry is too large." }, { status: 413 });
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const rateKey = `contact:${ip}`;
  if (env.CACHE && Number(await env.CACHE.get(rateKey) || 0) >= 5) return Response.json({ error: "Too many enquiries from this connection. Please try again later." }, { status: 429 });
  const body = await request.json<ContactBody>().catch(() => null);
  if (!body || body.website) return Response.json({ ok: true });
  if (!body.name?.trim() || !emailPattern.test(body.email || "") || !body.message || body.message.trim().length < 20 || body.consent !== "yes") {
    return Response.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  if (!env.TURNSTILE_SECRET_KEY) return Response.json({ error: "The spam check is not configured." }, { status: 503 });
  {
    const turnstile = new FormData();
    turnstile.set("secret", env.TURNSTILE_SECRET_KEY);
    turnstile.set("response", body.turnstileToken || body["cf-turnstile-response"] || "");
    turnstile.set("remoteip", request.headers.get("CF-Connecting-IP") || "");
    const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: turnstile });
    const result = await check.json<{ success: boolean }>();
    if (!result.success) return Response.json({ error: "Spam check failed." }, { status: 403 });
  }

  if (!env.DB) return Response.json({ error: "The enquiry service is not configured." }, { status: 503 });
  const id = crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO leads (id, name, email, company, project_type, budget_range, message, status, consent_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'new', datetime('now'), datetime('now'))`)
    .bind(id, body.name.trim(), body.email!.trim().toLowerCase(), body.company?.trim() || null, body.projectType || null, body.budget || null, body.message.trim())
    .run();
  if (env.CACHE) { const count = Number(await env.CACHE.get(rateKey) || 0) + 1; await env.CACHE.put(rateKey, String(count), { expirationTtl: 3600 }); }

  if (env.RESEND_API_KEY && env.CONTACT_FROM_EMAIL) {
    await Promise.allSettled([
      sendEmail(env.RESEND_API_KEY, env.CONTACT_FROM_EMAIL, "buildwithduke@outlook.com", `New project enquiry from ${body.name}`, `<p><strong>${escapeHtml(body.name)}</strong> (${escapeHtml(body.email!)}) sent a project enquiry.</p><p><strong>Company:</strong> ${escapeHtml(body.company || "Not supplied")}<br><strong>Project:</strong> ${escapeHtml(body.projectType || "Not supplied")}<br><strong>Budget:</strong> ${escapeHtml(body.budget || "Not supplied")}</p><p>${escapeHtml(body.message)}</p>`),
      sendEmail(env.RESEND_API_KEY, env.CONTACT_FROM_EMAIL, body.email!, "Your buildwithduke enquiry landed", `<p>Hi ${escapeHtml(body.name)},</p><p>Got it. I usually reply within 24 hours, UK time.</p><p>— Duke</p>`),
    ]);
  }
  return Response.json({ ok: true, id }, { status: 201 });
};

function sendEmail(apiKey: string, from: string, to: string, subject: string, html: string) {
  return fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to, subject, html }) });
}
function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]!); }
