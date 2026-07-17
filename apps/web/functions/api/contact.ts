interface Env {
  DB: D1Database;
  TURNSTILE_SECRET_KEY?: string;
  RESEND_API_KEY?: string;
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
  const body = await request.json<ContactBody>().catch(() => null);
  if (!body || body.website) return Response.json({ ok: true });
  if (!body.name?.trim() || !emailPattern.test(body.email || "") || !body.message || body.message.trim().length < 20 || body.consent !== "yes") {
    return Response.json({ error: "Please complete all required fields." }, { status: 400 });
  }

  if (env.TURNSTILE_SECRET_KEY) {
    const turnstile = new FormData();
    turnstile.set("secret", env.TURNSTILE_SECRET_KEY);
    turnstile.set("response", body.turnstileToken || body["cf-turnstile-response"] || "");
    turnstile.set("remoteip", request.headers.get("CF-Connecting-IP") || "");
    const check = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: turnstile });
    const result = await check.json<{ success: boolean }>();
    if (!result.success) return Response.json({ error: "Spam check failed." }, { status: 403 });
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO leads (id, name, email, company, project_type, budget_range, message, status, consent_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'new', datetime('now'), datetime('now'))`)
    .bind(id, body.name.trim(), body.email!.trim().toLowerCase(), body.company?.trim() || null, body.projectType || null, body.budget || null, body.message.trim())
    .run();

  if (env.RESEND_API_KEY) {
    await Promise.allSettled([
      sendEmail(env.RESEND_API_KEY, "buildwithduke@outlook.com", `New project enquiry from ${body.name}`, `<p><strong>${escapeHtml(body.name)}</strong> (${escapeHtml(body.email!)}) sent a project enquiry.</p><p>${escapeHtml(body.message)}</p>`),
      sendEmail(env.RESEND_API_KEY, body.email!, "Your buildwithduke enquiry landed", `<p>Hi ${escapeHtml(body.name)},</p><p>Got it. I usually reply within 24 hours, UK time.</p><p>— Duke</p>`),
    ]);
  }
  return Response.json({ ok: true, id }, { status: 201 });
};

function sendEmail(apiKey: string, to: string, subject: string, html: string) {
  return fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from: "Duke <hello@buildwithduke.co.uk>", to, subject, html }) });
}
function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]!); }
