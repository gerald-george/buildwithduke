import { requireAdmin } from "../_auth";
import { escapeHtml } from "../../_shared/html";
import { getMicrosoftAccessToken, sendMicrosoftMail, type MicrosoftEnv } from "../../_shared/microsoft";

type Lead = { id: string; name: string; email: string; status: string };
type GraphMessage = {
  id: string; subject?: string; bodyPreview?: string; receivedDateTime?: string; sentDateTime?: string;
  from?: { emailAddress?: { address?: string } }; toRecipients?: Array<{ emailAddress?: { address?: string } }>;
};

export const onRequestGet: PagesFunction<MicrosoftEnv> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env);
  if (auth.error) return auth.error;
  if (!env.DB) return Response.json({ error: "The D1 database binding is not configured." }, { status: 503 });
  const leadId = new URL(request.url).searchParams.get("leadId") || "";
  const messages = (await env.DB.prepare("SELECT * FROM lead_messages WHERE lead_id = ? ORDER BY sent_at ASC").bind(leadId).all()).results;
  return Response.json({ messages }, { headers: { "Cache-Control": "no-store" } });
};

export const onRequestPost: PagesFunction<MicrosoftEnv> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env, true);
  if (auth.error) return auth.error;
  if (!env.DB) return Response.json({ error: "The D1 database binding is not configured." }, { status: 503 });
  const body = await request.json<{ leadId?: string; action?: string; subject?: string; message?: string }>().catch(() => null);
  const lead = body?.leadId ? await env.DB.prepare("SELECT id, name, email, status FROM leads WHERE id = ?").bind(body.leadId).first<Lead>() : null;
  if (!lead) return Response.json({ error: "The lead could not be found." }, { status: 404 });
  const accessToken = await getMicrosoftAccessToken(env).catch(error => nullWithMessage(error));
  if (typeof accessToken !== "string") return Response.json({ error: accessToken.message }, { status: 503 });

  if (body?.action === "sync") {
    try { const imported = await syncMessages(env.DB, accessToken, lead); return Response.json({ ok: true, imported }); }
    catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Microsoft inbox synchronisation failed." }, { status: 502 }); }
  }
  const subject = String(body?.subject || "").trim();
  const message = String(body?.message || "").trim();
  if (subject.length < 3 || message.length < 2) return Response.json({ error: "Add a subject and message before sending." }, { status: 400 });
  if (subject.length > 180 || message.length > 20_000) return Response.json({ error: "The message is too long." }, { status: 400 });
  const html = `<p>Hi ${escapeHtml(lead.name.split(/\s+/)[0] || lead.name)},</p>${message.split(/\n{2,}/).map(paragraph => `<p>${escapeHtml(paragraph).replaceAll("\n", "<br>")}</p>`).join("")}<p>— Duke<br>Build With Duke</p>`;
  try { await sendMicrosoftMail(accessToken, lead.email, subject, html); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Microsoft could not send the message." }, { status: 502 }); }
  await env.DB.batch([
    env.DB.prepare("INSERT INTO lead_messages (id, lead_id, direction, provider, subject, body_text, sent_at) VALUES (?, ?, 'outbound', 'microsoft', ?, ?, datetime('now'))").bind(crypto.randomUUID(), lead.id, subject, message),
    env.DB.prepare("UPDATE leads SET status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END, last_contacted_at = datetime('now') WHERE id = ?").bind(lead.id),
  ]);
  return Response.json({ ok: true });
};

async function syncMessages(db: D1Database, accessToken: string, lead: Lead) {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const select = "$select=id,subject,bodyPreview,receivedDateTime,sentDateTime,from,toRecipients&$top=50&$orderby=receivedDateTime desc";
  const [inboxResponse, sentResponse] = await Promise.all([
    fetch(`https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages?${select}`, { headers }),
    fetch(`https://graph.microsoft.com/v1.0/me/mailFolders/sentitems/messages?${select}`, { headers }),
  ]);
  if (!inboxResponse.ok || !sentResponse.ok) throw new Error("Microsoft inbox synchronisation failed.");
  const inbox = await inboxResponse.json<{ value?: GraphMessage[] }>();
  const sent = await sentResponse.json<{ value?: GraphMessage[] }>();
  const address = lead.email.toLowerCase();
  const matches = [
    ...(inbox.value || []).filter(message => message.from?.emailAddress?.address?.toLowerCase() === address).map(message => ({ message, direction: "inbound" })),
    ...(sent.value || []).filter(message => message.toRecipients?.some(recipient => recipient.emailAddress?.address?.toLowerCase() === address)).map(message => ({ message, direction: "outbound" })),
  ] as Array<{ message: GraphMessage; direction: "inbound" | "outbound" }>;
  let imported = 0;
  for (const item of matches) {
    const result = await db.prepare(`INSERT OR IGNORE INTO lead_messages (id, lead_id, direction, provider, provider_message_id, subject, body_text, sent_at)
      VALUES (?, ?, ?, 'microsoft', ?, ?, ?, ?)`)
      .bind(crypto.randomUUID(), lead.id, item.direction, item.message.id, item.message.subject || "(No subject)", item.message.bodyPreview || "", item.message.receivedDateTime || item.message.sentDateTime || new Date().toISOString()).run();
    if (result.meta.changes) imported += 1;
  }
  return imported;
}

function nullWithMessage(error: unknown) {
  return { message: error instanceof Error ? error.message : "Microsoft Graph is unavailable." };
}
