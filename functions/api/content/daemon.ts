interface Env { DB?: D1Database }

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.DB) return Response.json({ commands: [] });
  try {
    const commands = (await env.DB.prepare("SELECT command, response_text, action_type, action_target FROM daemon_commands WHERE is_active = 1 ORDER BY command ASC").all()).results;
    return Response.json({ commands }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
  } catch {
    return Response.json({ commands: [] });
  }
};
