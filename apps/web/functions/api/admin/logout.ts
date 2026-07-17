import { AdminEnv, expiredSessionCookie, requireAdmin } from "./_auth";

export const onRequestPost: PagesFunction<AdminEnv> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env, true);
  if (auth.error) return auth.error;
  return Response.json({ ok: true }, { headers: { "Set-Cookie": expiredSessionCookie, "Cache-Control": "no-store" } });
};
