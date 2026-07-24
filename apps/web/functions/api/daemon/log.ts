interface Env { DB: D1Database }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const consent = request.headers.get("X-Analytics-Consent");
  if (consent !== "yes") return Response.json({ stored: false });
  const body = await request.json<{ event?: string; path?: string }>().catch(() => ({}));
  if (!body.event) return Response.json({ error: "Missing event" }, { status: 400 });
  await env.DB.batch([
    env.DB.prepare("INSERT INTO daemon_events (id, event, path, created_at) VALUES (?, ?, ?, datetime('now'))").bind(crypto.randomUUID(), body.event.slice(0, 80), body.path?.slice(0, 160) || null),
    env.DB.prepare("DELETE FROM daemon_events WHERE datetime(created_at) < datetime('now', '-90 days')"),
  ]);
  return Response.json({ stored: true }, { status: 201 });
};
