import { requireAdmin, type AdminEnv } from "./_auth";

type Env = AdminEnv & { OPENROUTER_API_KEY?: string };
type OpenRouterModel = {
  id?: string;
  name?: string;
  description?: string;
  context_length?: number;
  pricing?: { prompt?: string; completion?: string };
  architecture?: { modality?: string; input_modalities?: string[]; output_modalities?: string[] };
  supported_parameters?: string[];
};

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const auth = await requireAdmin(request, env);
  if (auth.error) return auth.error;
  const headers: Record<string, string> = { Accept: "application/json", "HTTP-Referer": "https://buildwithduke.pages.dev", "X-Title": "Build With Duke Admin" };
  if (env.OPENROUTER_API_KEY) headers.Authorization = `Bearer ${env.OPENROUTER_API_KEY}`;
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", { headers });
    const payload = await response.json<{ data?: OpenRouterModel[]; error?: { message?: string } }>();
    if (!response.ok) return Response.json({ error: payload.error?.message || "OpenRouter could not provide its model catalogue." }, { status: 502 });
    const models = (payload.data || []).filter(model => model.id).map(model => {
      const promptPrice = Number(model.pricing?.prompt || 0);
      const completionPrice = Number(model.pricing?.completion || 0);
      return {
        id: model.id!, name: model.name || model.id!, description: model.description || "", provider: model.id!.split("/")[0] || "other",
        contextLength: Number(model.context_length || 0), promptPrice, completionPrice,
        isFree: promptPrice === 0 && completionPrice === 0,
        modality: model.architecture?.modality || (model.architecture?.input_modalities || []).join(" + ") || "text",
        supportsTools: (model.supported_parameters || []).includes("tools"),
      };
    }).sort((left, right) => left.name.localeCompare(right.name));
    return Response.json({ models, fetchedAt: new Date().toISOString() }, { headers: { "Cache-Control": "private, max-age=300" } });
  } catch {
    return Response.json({ error: "The OpenRouter model catalogue is temporarily unavailable." }, { status: 502 });
  }
};
