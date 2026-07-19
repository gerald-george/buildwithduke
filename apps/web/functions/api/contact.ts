import type { AdminEnv } from "./admin/_auth";

interface Env extends AdminEnv {
  TURNSTILE_SECRET_KEY?: string;
  GOOGLE_APPS_SCRIPT_URL?: string;
  CONTACT_RELAY_SECRET?: string;
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

  await deliverNotification(env, body);
  return Response.json({ ok: true, id }, { status: 201 });
};

async function deliverNotification(env: Env, body: ContactBody) {
  if (!env.GOOGLE_APPS_SCRIPT_URL || !env.CONTACT_RELAY_SECRET) return;
  try {
    const relayUrl = new URL(env.GOOGLE_APPS_SCRIPT_URL);
    if (relayUrl.protocol !== "https:" || relayUrl.hostname !== "script.google.com" || !relayUrl.pathname.startsWith("/macros/s/")) throw new Error("The Google Apps Script URL is invalid.");
    const response = await fetch(relayUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      body: JSON.stringify({
        relaySecret: env.CONTACT_RELAY_SECRET,
        name: body.name!.trim(),
        email: body.email!.trim().toLowerCase(),
        company: body.company?.trim() || "",
        projectType: body.projectType || "",
        budget: body.budget || "",
        message: body.message!.trim(),
      }),
      redirect: "follow",
    });
    const result = await response.json<{ ok?: boolean }>().catch(() => null);
    if (!response.ok || !result?.ok) throw new Error("The Gmail notification relay rejected the request.");
  } catch (error) {
    console.error("Contact notification delivery failed.", error instanceof Error ? error.message : "Unknown relay error");
  }
}
