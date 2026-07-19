interface Env { MEDIA?: R2Bucket }

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  if (!env.MEDIA) return new Response("Media storage is unavailable.", { status: 503 });
  const key = String(params.key || "");
  if (!/^[a-f0-9-]+\.(?:jpg|png|webp|avif|pdf)$/.test(key)) return new Response("Not found.", { status: 404 });
  const object = await env.MEDIA.get(key);
  if (!object) return new Response("Not found.", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.body, { headers });
};
