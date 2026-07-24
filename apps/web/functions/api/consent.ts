interface Env { DB?: D1Database }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json<{ analytics?: boolean; marketing?: boolean }>().catch(() => null);
  if (!body) return Response.json({ error: "Invalid preferences" }, { status: 400 });
  if (env.DB) {
    await env.DB.batch([
      env.DB.prepare("INSERT INTO cookie_consents (id, necessary, analytics, marketing, created_at) VALUES (?, 1, ?, ?, datetime('now'))").bind(crypto.randomUUID(), body.analytics ? 1 : 0, body.marketing ? 1 : 0),
      env.DB.prepare("DELETE FROM cookie_consents WHERE datetime(created_at) < datetime('now', '-12 months')"),
    ]).catch(() => undefined);
  }
  return Response.json({ stored: Boolean(env.DB) }, { status: 201 });
};
