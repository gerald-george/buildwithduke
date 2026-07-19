import { AdminEnv, requireAdmin } from "./_auth";

interface MediaEnv extends AdminEnv { MEDIA?: R2Bucket }

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
  ["application/pdf", "pdf"],
]);

export const onRequestPost: PagesFunction<MediaEnv> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env, true);
  if (auth.error) return auth.error;
  if (!env.MEDIA) return Response.json({ error: "The R2 media binding is not configured." }, { status: 503 });
  if (Number(request.headers.get("Content-Length") || 0) > 8_500_000) return Response.json({ error: "Media must be smaller than 8 MB." }, { status: 413 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || !file.size || file.size > 8_000_000) return Response.json({ error: "Choose a file smaller than 8 MB." }, { status: 400 });
  const extension = allowedTypes.get(file.type);
  if (!extension) return Response.json({ error: "Upload a JPG, PNG, WebP, AVIF or PDF file." }, { status: 415 });

  const key = `${crypto.randomUUID()}.${extension}`;
  await env.MEDIA.put(key, file.stream(), {
    httpMetadata: { contentType: file.type, cacheControl: "public, max-age=31536000, immutable" },
    customMetadata: { uploadedBy: auth.session.email, originalName: file.name.slice(0, 180) },
  });
  return Response.json({ ok: true, key, url: `/api/media/${key}` }, { status: 201, headers: { "Cache-Control": "no-store" } });
};
