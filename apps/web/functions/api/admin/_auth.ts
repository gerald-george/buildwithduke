export interface AdminEnv {
  DB?: D1Database;
  CACHE?: KVNamespace;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD_HASH?: string;
  ADMIN_SESSION_SECRET?: string;
}

export type AdminSession = { email: string; exp: number; csrf: string };
const encoder = new TextEncoder();

const hex = (bytes: ArrayBuffer) => Array.from(new Uint8Array(bytes), byte => byte.toString(16).padStart(2, "0")).join("");
const base64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
const fromBase64url = (value: string) => Uint8Array.from(atob(value.replaceAll("-", "+").replaceAll("_", "/")), char => char.charCodeAt(0));

export async function passwordDigest(password: string) {
  return hex(await crypto.subtle.digest("SHA-256", encoder.encode(password)));
}

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return base64url(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(value))));
}

export async function createSession(env: AdminEnv, email: string) {
  if (!env.ADMIN_SESSION_SECRET) throw new Error("ADMIN_SESSION_SECRET is not configured");
  const session: AdminSession = { email, exp: Date.now() + 8 * 60 * 60 * 1000, csrf: crypto.randomUUID() };
  const payload = base64url(encoder.encode(JSON.stringify(session)));
  return { session, token: `${payload}.${await hmac(env.ADMIN_SESSION_SECRET, payload)}` };
}

export async function readSession(request: Request, env: AdminEnv): Promise<AdminSession | null> {
  if (!env.ADMIN_SESSION_SECRET) return null;
  const cookie = request.headers.get("Cookie") || "";
  const token = cookie.split(";").map(part => part.trim()).find(part => part.startsWith("duke_admin_session="))?.split("=").slice(1).join("=");
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || signature !== await hmac(env.ADMIN_SESSION_SECRET, payload)) return null;
  try {
    const session = JSON.parse(new TextDecoder().decode(fromBase64url(payload))) as AdminSession;
    return session.exp > Date.now() ? session : null;
  } catch { return null; }
}

export async function requireAdmin(request: Request, env: AdminEnv, csrf = false) {
  const session = await readSession(request, env);
  if (!session) return { error: Response.json({ error: "Your admin session has expired." }, { status: 401 }) };
  if (csrf && request.headers.get("X-CSRF-Token") !== session.csrf) return { error: Response.json({ error: "The security token is invalid. Refresh and try again." }, { status: 403 }) };
  return { session };
}

export const sessionCookie = (token: string) => `duke_admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=28800`;
export const expiredSessionCookie = "duke_admin_session=; HttpOnly; Secure; SameSite=Strict; Path=/api/admin; Max-Age=0";

export function adminDatabaseError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || "");
  if (/no such table|no such column/i.test(message)) {
    return Response.json({ error: "The production database schema is incomplete. Apply D1 migrations 0001–0004, then refresh the admin workspace." }, { status: 503 });
  }
  return Response.json({ error: "The admin database could not complete this request. Try again, then check the D1 binding if the problem continues." }, { status: 500 });
}
