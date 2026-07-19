import { runAutoblog, type AutoblogEnv } from "../_shared/autoblog";

export const onRequestPost: PagesFunction<AutoblogEnv> = async ({ request, env }) => {
  if (!env.AUTOBLOG_CRON_SECRET) return Response.json({ error: "The autoblog scheduler secret is not configured." }, { status: 503 });
  if (request.headers.get("Authorization") !== `Bearer ${env.AUTOBLOG_CRON_SECRET}`) return Response.json({ error: "Unauthorized." }, { status: 401 });
  try { return Response.json(await runAutoblog(env, "schedule")); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Autoblog failed." }, { status: 500 }); }
};
