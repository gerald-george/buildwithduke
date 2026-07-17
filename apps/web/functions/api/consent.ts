interface Env { DB?: D1Database }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const body = await request.json<{ analytics?: boolean; marketing?: boolean }>().catch(() => null);
  if (!body) return Response.json({ error: "Invalid preferences" }, { status: 400 });
  if (env.DB) {
    await env.DB.prepare("INSERT INTO cookie_consents (id, necessary, analytics, marketing, created_at) VALUES (?, 1, ?, ?, datetime('now'))")
      .bind(crypto.randomUUID(), body.analytics ? 1 : 0, body.marketing ? 1 : 0).run().catch(() => undefined);
  }
  return Response.json({ stored: Boolean(env.DB) }, { status: 201 });
};
