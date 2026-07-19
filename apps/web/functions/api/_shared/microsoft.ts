import type { AdminEnv } from "../admin/_auth";

export interface MicrosoftEnv extends AdminEnv {
  MICROSOFT_CLIENT_ID?: string;
  MICROSOFT_CLIENT_SECRET?: string;
  MICROSOFT_TENANT_ID?: string;
  INTEGRATION_ENCRYPTION_KEY?: string;
}

export const microsoftScopes = "openid profile offline_access User.Read Mail.Read Mail.Send";

type Connection = {
  id: string;
  account_email: string;
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  expires_at: string;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  scope?: string;
  error_description?: string;
};

export function microsoftConfigured(env: MicrosoftEnv) {
  return Boolean(env.DB && env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET && env.INTEGRATION_ENCRYPTION_KEY);
}

export async function getMicrosoftAccessToken(env: MicrosoftEnv) {
  if (!microsoftConfigured(env)) throw new Error("Microsoft Graph is not configured.");
  const connection = await env.DB!.prepare("SELECT * FROM microsoft_connections WHERE id = 'primary'").first<Connection>();
  if (!connection) throw new Error("No Microsoft account is connected.");
  if (Date.parse(connection.expires_at) > Date.now() + 90_000) return decrypt(env.INTEGRATION_ENCRYPTION_KEY!, connection.access_token_encrypted);

  const refreshToken = await decrypt(env.INTEGRATION_ENCRYPTION_KEY!, connection.refresh_token_encrypted);
  const form = new URLSearchParams({
    client_id: env.MICROSOFT_CLIENT_ID!, client_secret: env.MICROSOFT_CLIENT_SECRET!, grant_type: "refresh_token",
    refresh_token: refreshToken, scope: microsoftScopes,
  });
  const response = await fetch(`${loginBase(env)}/oauth2/v2.0/token`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: form,
  });
  const tokens = await response.json<TokenResponse>();
  if (!response.ok || !tokens.access_token) throw new Error(tokens.error_description || "Microsoft access could not be refreshed.");
  const nextRefresh = tokens.refresh_token || refreshToken;
  await env.DB!.prepare(`UPDATE microsoft_connections SET access_token_encrypted = ?, refresh_token_encrypted = ?, expires_at = ?, scopes = ?, updated_at = datetime('now') WHERE id = 'primary'`)
    .bind(
      await encrypt(env.INTEGRATION_ENCRYPTION_KEY!, tokens.access_token),
      await encrypt(env.INTEGRATION_ENCRYPTION_KEY!, nextRefresh),
      new Date(Date.now() + Number(tokens.expires_in || 3600) * 1000).toISOString(), tokens.scope || microsoftScopes,
    ).run();
  return tokens.access_token;
}

export async function getMicrosoftMailbox(env: MicrosoftEnv) {
  const accessToken = await getMicrosoftAccessToken(env);
  const connection = await env.DB!.prepare("SELECT account_email FROM microsoft_connections WHERE id = 'primary'").first<{ account_email: string }>();
  if (!connection?.account_email) throw new Error("The connected Microsoft mailbox is unavailable.");
  return { accessToken, email: connection.account_email };
}

export async function sendMicrosoftMail(accessToken: string, to: string, subject: string, html: string) {
  const response = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message: { subject, body: { contentType: "HTML", content: html }, toRecipients: [{ emailAddress: { address: to } }] }, saveToSentItems: true }),
  });
  if (!response.ok) throw new Error(`Microsoft Graph rejected the message (${response.status}).`);
}

export async function encrypt(secret: string, value: string) {
  const key = await encryptionKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(value)));
  return `${base64url(iv)}.${base64url(encrypted)}`;
}

export async function decrypt(secret: string, value: string) {
  const [ivValue, encryptedValue] = value.split(".");
  if (!ivValue || !encryptedValue) throw new Error("The stored Microsoft credential is invalid.");
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv: fromBase64url(ivValue) }, await encryptionKey(secret), fromBase64url(encryptedValue));
  return new TextDecoder().decode(decrypted);
}

export function loginBase(env: MicrosoftEnv) {
  return `https://login.microsoftonline.com/${encodeURIComponent(env.MICROSOFT_TENANT_ID || "common")}`;
}

async function encryptionKey(secret: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", digest, "AES-GCM", false, ["encrypt", "decrypt"]);
}

function base64url(value: Uint8Array) {
  return btoa(String.fromCharCode(...value)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function fromBase64url(value: string) {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), character => character.charCodeAt(0));
}
