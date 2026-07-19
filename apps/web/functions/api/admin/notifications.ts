import { requireAdmin, type AdminEnv } from "./_auth";

interface Env extends AdminEnv {
  GOOGLE_APPS_SCRIPT_URL?: string;
  CONTACT_RELAY_SECRET?: string;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env);
  if (auth.error) return auth.error;
  return Response.json({
    configured: Boolean(env.GOOGLE_APPS_SCRIPT_URL && env.CONTACT_RELAY_SECRET),
    provider: "Google Apps Script MailApp",
    replyMailbox: "buildwithduke@outlook.com",
  }, { headers: { "Cache-Control": "no-store" } });
};
