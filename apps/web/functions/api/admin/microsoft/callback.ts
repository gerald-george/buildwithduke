import { encrypt, loginBase, microsoftConfigured, microsoftScopes, type MicrosoftEnv } from "../../_shared/microsoft";

type TokenResponse = { access_token?: string; refresh_token?: string; expires_in?: number; scope?: string; error_description?: string };
type Profile = { id?: string; displayName?: string; mail?: string; userPrincipalName?: string };

export const onRequestGet: PagesFunction<MicrosoftEnv> = async ({ request, env }) => {
  const requestUrl = new URL(request.url);
  const adminUrl = new URL("/admin", request.url);
  const state = requestUrl.searchParams.get("state") || "";
  const code = requestUrl.searchParams.get("code") || "";
  const providerError = requestUrl.searchParams.get("error_description");
  if (providerError) return redirect(adminUrl, "microsoft", "error", providerError);
  if (!microsoftConfigured(env)) return redirect(adminUrl, "microsoft", "error", "Microsoft integration is not configured.");
  const validState = await env.DB!.prepare("SELECT state FROM microsoft_oauth_states WHERE state = ? AND expires_at > datetime('now')").bind(state).first();
  if (!state || !code || !validState) return redirect(adminUrl, "microsoft", "error", "The Microsoft sign-in request expired. Please start again.");
  await env.DB!.prepare("DELETE FROM microsoft_oauth_states WHERE state = ?").bind(state).run();

  const redirectUri = new URL("/api/admin/microsoft/callback", request.url).toString();
  const response = await fetch(`${loginBase(env)}/oauth2/v2.0/token`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: env.MICROSOFT_CLIENT_ID!, client_secret: env.MICROSOFT_CLIENT_SECRET!, grant_type: "authorization_code",
      code, redirect_uri: redirectUri, scope: microsoftScopes,
    }),
  });
  const tokens = await response.json<TokenResponse>();
  if (!response.ok || !tokens.access_token || !tokens.refresh_token) return redirect(adminUrl, "microsoft", "error", tokens.error_description || "Microsoft did not return a reusable connection.");
  const profileResponse = await fetch("https://graph.microsoft.com/v1.0/me?$select=id,displayName,mail,userPrincipalName", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
  const profile = await profileResponse.json<Profile>();
  const email = profile.mail || profile.userPrincipalName;
  if (!profileResponse.ok || !profile.id || !email) return redirect(adminUrl, "microsoft", "error", "The connected Microsoft profile has no usable mailbox.");

  await env.DB!.prepare(`INSERT INTO microsoft_connections
    (id, account_id, account_email, account_name, tenant_id, access_token_encrypted, refresh_token_encrypted, expires_at, scopes, connected_at, updated_at)
    VALUES ('primary', ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ON CONFLICT(id) DO UPDATE SET account_id = excluded.account_id, account_email = excluded.account_email,
      account_name = excluded.account_name, tenant_id = excluded.tenant_id, access_token_encrypted = excluded.access_token_encrypted,
      refresh_token_encrypted = excluded.refresh_token_encrypted, expires_at = excluded.expires_at, scopes = excluded.scopes,
      connected_at = datetime('now'), updated_at = datetime('now')`)
    .bind(profile.id, email.toLowerCase(), profile.displayName || null, env.MICROSOFT_TENANT_ID || "common",
      await encrypt(env.INTEGRATION_ENCRYPTION_KEY!, tokens.access_token), await encrypt(env.INTEGRATION_ENCRYPTION_KEY!, tokens.refresh_token),
      new Date(Date.now() + Number(tokens.expires_in || 3600) * 1000).toISOString(), tokens.scope || microsoftScopes).run();
  return redirect(adminUrl, "microsoft", "connected");
};

function redirect(url: URL, key: string, value: string, detail?: string) {
  url.searchParams.set(key, value);
  if (detail) url.searchParams.set("detail", detail.slice(0, 240));
  return Response.redirect(url.toString(), 302);
}
