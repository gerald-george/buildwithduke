import { AdminEnv, createSession, passwordDigest, sessionCookie } from "./_auth";

export const onRequestPost: PagesFunction<AdminEnv> = async ({ request, env }) => {
  if (!env.ADMIN_SESSION_SECRET) return Response.json({ error: "Admin access is not configured." }, { status: 503 });
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const rateKey = `admin-login:${ip}`;
  if (env.CACHE && Number(await env.CACHE.get(rateKey) || 0) >= 8) return Response.json({ error: "Too many sign-in attempts. Try again in 15 minutes." }, { status: 429 });
  const body = await request.json<{ email?: string; password?: string }>().catch(() => null);
  if (!body?.email || !body.password || body.password.length < 12) return Response.json({ error: "Enter valid admin credentials." }, { status: 400 });

  let email = env.ADMIN_EMAIL?.trim().toLowerCase();
  let storedHash = env.ADMIN_PASSWORD_HASH?.trim();
  if ((!email || !storedHash) && env.DB) {
    const user = await env.DB.prepare("SELECT email, password_hash FROM admin_users WHERE lower(email) = lower(?) LIMIT 1").bind(body.email).first<{ email: string; password_hash: string }>();
    email = user?.email.trim().toLowerCase(); storedHash = user?.password_hash?.trim();
  }
  const suppliedHash = await passwordDigest(body.password);
  const expectedHash = storedHash?.replace(/^sha256:/, "").trim().toLowerCase();
  if (!email || email !== body.email.trim().toLowerCase() || !expectedHash || suppliedHash !== expectedHash) {
    if (env.CACHE) { const count = Number(await env.CACHE.get(rateKey) || 0) + 1; await env.CACHE.put(rateKey, String(count), { expirationTtl: 900 }); }
    return Response.json({ error: "Email or password is incorrect." }, { status: 401 });
  }
  if (env.CACHE) await env.CACHE.delete(rateKey);
  const { session, token } = await createSession(env, email);
  return Response.json({ ok: true, csrf: session.csrf }, { headers: { "Set-Cookie": sessionCookie(token), "Cache-Control": "no-store" } });
};
