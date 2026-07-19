import { requireAdmin } from "../_auth";
import { loginBase, microsoftConfigured, microsoftScopes, type MicrosoftEnv } from "../../_shared/microsoft";

export const onRequestGet: PagesFunction<MicrosoftEnv> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env);
  if (auth.error) return auth.error;
  if (!microsoftConfigured(env)) return Response.json({ configured: false, connected: false }, { headers: { "Cache-Control": "no-store" } });
  const connection = await env.DB!.prepare("SELECT account_email, account_name, scopes, connected_at, updated_at FROM microsoft_connections WHERE id = 'primary'").first();
  return Response.json({ configured: true, connected: Boolean(connection), connection }, { headers: { "Cache-Control": "no-store" } });
};

export const onRequestPost: PagesFunction<MicrosoftEnv> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env, true);
  if (auth.error) return auth.error;
  if (!microsoftConfigured(env)) return Response.json({ error: "Add the Microsoft client ID, client secret and integration encryption key to Cloudflare first." }, { status: 503 });
  const state = crypto.randomUUID();
  await env.DB!.prepare("DELETE FROM microsoft_oauth_states WHERE expires_at <= datetime('now')").run();
  await env.DB!.prepare("INSERT INTO microsoft_oauth_states (state, expires_at) VALUES (?, datetime('now', '+10 minutes'))").bind(state).run();
  const redirectUri = new URL("/api/admin/microsoft/callback", request.url).toString();
  const authorize = new URL(`${loginBase(env)}/oauth2/v2.0/authorize`);
  authorize.search = new URLSearchParams({
    client_id: env.MICROSOFT_CLIENT_ID!, response_type: "code", redirect_uri: redirectUri, response_mode: "query",
    scope: microsoftScopes, state, prompt: "select_account",
  }).toString();
  return Response.json({ url: authorize.toString() });
};

export const onRequestDelete: PagesFunction<MicrosoftEnv> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env, true);
  if (auth.error) return auth.error;
  if (!env.DB) return Response.json({ error: "The D1 database binding is not configured." }, { status: 503 });
  await env.DB.prepare("DELETE FROM microsoft_connections WHERE id = 'primary'").run();
  return Response.json({ ok: true });
};
