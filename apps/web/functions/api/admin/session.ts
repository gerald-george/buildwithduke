import { AdminEnv, readSession } from "./_auth";

export const onRequestGet: PagesFunction<AdminEnv> = async ({ request, env }) => {
  const session = await readSession(request, env);
  if (!session) return Response.json({ error: "Not signed in." }, { status: 401, headers: { "Cache-Control": "no-store" } });
  return Response.json({ email: session.email, csrf: session.csrf }, { headers: { "Cache-Control": "no-store" } });
};
