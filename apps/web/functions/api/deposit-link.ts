interface Env { STRIPE_SECRET_KEY: string; ADMIN_API_TOKEN: string }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (request.headers.get("Authorization") !== `Bearer ${env.ADMIN_API_TOKEN}`) return Response.json({ error: "Unauthorised" }, { status: 401 });
  const body = await request.json<{ amount?: number; client?: string; email?: string }>();
  if (!body.amount || body.amount < 10000 || !body.email) return Response.json({ error: "Invalid deposit details" }, { status: 400 });
  const form = new URLSearchParams();
  form.set("line_items[0][price_data][currency]", "gbp");
  form.set("line_items[0][price_data][unit_amount]", String(body.amount));
  form.set("line_items[0][price_data][product_data][name]", `Project deposit — ${body.client || "buildwithduke"}`);
  form.set("line_items[0][quantity]", "1");
  form.set("after_completion[type]", "redirect");
  form.set("after_completion[redirect][url]", "https://buildwithduke.co.uk/contact?deposit=received");
  const response = await fetch("https://api.stripe.com/v1/payment_links", { method: "POST", headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, "Content-Type": "application/x-www-form-urlencoded" }, body: form });
  return new Response(response.body, { status: response.status, headers: { "content-type": "application/json" } });
};
