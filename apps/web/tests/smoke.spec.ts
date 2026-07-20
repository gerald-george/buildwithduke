import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route(/https:\/\/(?:fonts\.(?:googleapis|gstatic)\.com|challenges\.cloudflare\.com)\/.*/, route => route.abort());
  await page.addInitScript(() => localStorage.setItem("cookie-preferences", JSON.stringify({ necessary: true, analytics: false, marketing: false })));
});

test("core routes render without page errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("I build");
  await page.goto("/projects");
  await expect(page.getByRole("article")).toHaveCount(8);
  await expect(page.getByText("Folder-to-text merger", { exact: true })).toBeVisible();
  await expect(page.getByText("Bemdproperties", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Unconventional Soccer Giveaway", { exact: true })).toHaveCount(0);
  await expect(page.locator('.project-index-card img[src="/projects/unconventional-soccer.png"]')).toHaveCount(0);
  await page.goto("/contact");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel(/Tell me about it/)).toBeVisible();
  expect(errors).toEqual([]);
});

test("every public route and retained case study mounts cleanly", async ({ page }) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const route of ["/services", "/about", "/pricing", "/cv", "/articles", "/privacy", "/cookies", "/terms", "/projects/files-combiner"]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("theme control changes and persists the document theme", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("navigation works at the current viewport", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("link", { name: "Pricing", exact: true }).first().click();
  await expect(page).toHaveURL(/\/pricing$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Straightforward pricing");
});

test("DAEMON keeps its terminal interaction and executes navigation commands", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: /DAEMON/ }).click();
  const command = page.getByLabel("$", { exact: true });
  await command.fill("help");
  await command.press("Enter");
  await expect(page.getByText(/Utilities: status · time · date · pwd · ls · theme · clear · sudo hire-duke/)).toBeVisible();
  await command.fill("projects");
  await command.press("Enter");
  await expect(page).toHaveURL(/\/projects$/);
});

test("DAEMON visibility comes from managed settings with no public toggle", async ({ page }) => {
  await page.route("**/api/content", route => route.fulfill({ json: { settings: [{ key: "visitor_guide_enabled", value: "false" }] } }));
  await page.goto("/");
  await expect(page.getByLabel("DAEMON interactive terminal")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /enable|disable|show|hide.*DAEMON/i })).toHaveCount(0);
});

test("brand wordmark and updated Growth pricing are rendered", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.locator(".brand-mark use").first()).toHaveAttribute("href", "/logo.svg#brand-logo");
  await expect(page.locator(".logo-wordmark").first()).toHaveText("<BUILD WITH DUKE/>");
  await expect(page.locator(".brand-mark use").first()).toHaveCSS("fill", "rgb(255, 255, 255)");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator(".brand-mark use").first()).toHaveCSS("fill", "rgb(23, 25, 31)");
  await expect(page.locator(".brand-with").first()).toHaveCSS("color", "rgb(23, 25, 31)");
  await expect(page.locator(".logo-wordmark").first()).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(page.locator(".logo-wordmark").first()).toHaveCSS("border-top-width", "0px");
  await expect(page.getByText("£999", { exact: true })).toBeVisible();
});

test("pricing keeps its values, localizes the symbol and omits conversion disclaimers", async ({ page }) => {
  await page.route("**/api/currency", route => route.fulfill({ json: { currency: "USD" } }));
  await page.goto("/pricing");
  await expect(page.getByText("$999", { exact: true })).toBeVisible();
  await expect(page.getByText("Showing USD based on your location · values are not converted", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/Five practical starting points shown/)).toHaveCount(0);
  await expect(page.getByText("£999", { exact: true })).toHaveCount(0);
});

test("below-fold content reveals when it enters the viewport", async ({ page }) => {
  await page.goto("/");
  const heading = page.locator("#work .section-head");
  await expect(heading).toHaveClass(/reveal-item/);
  await expect(heading).not.toHaveClass(/is-visible/);
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toHaveClass(/is-visible/);
});

test("scroll reveals survive client-side route changes, including About", async ({ page, isMobile }) => {
  await page.goto("/");
  await page.locator("#work").scrollIntoViewIfNeeded();
  if (isMobile) await page.getByRole("button", { name: "Toggle navigation" }).click();
  await page.getByRole("link", { name: "About", exact: true }).first().click();
  await expect(page).toHaveURL(/\/about$/);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  const aboutContent = page.locator(".about-intro > *");
  await aboutContent.first().scrollIntoViewIfNeeded();
  await expect(aboutContent.first()).toHaveClass(/is-visible/);
  await aboutContent.last().scrollIntoViewIfNeeded();
  await expect(aboutContent.last()).toHaveClass(/is-visible/);
  await expect(page.getByRole("heading", { name: "Library-science rigour. Product-builder energy." })).toBeVisible();
});

test("hero typing cursor and named technology ticker render", async ({ page }) => {
  await page.goto("/");
  const output = page.locator(".typing-output");
  await expect(output).toBeVisible();
  const cursor = await output.evaluate(element => getComputedStyle(element, "::after").content);
  expect(cursor).not.toBe("none");
  await expect(page.locator(".stack-ticker")).toBeVisible();
  await expect(page.locator(".ticker-item svg").first()).toBeVisible();
  await expect(page.locator(".ticker-group").first().getByText("React", { exact: true })).toBeVisible();
  await expect(page.locator(".ticker-group").first().getByText("OpenRouter", { exact: true })).toBeVisible();
  await expect(page.locator(".ticker-group").first().getByText("Python", { exact: true })).toBeVisible();
  await expect(page.locator(".ticker-group").first().getByText("Streamlit", { exact: true })).toBeVisible();
  await expect(page.locator(".ticker-group").first().getByText("WordPress", { exact: true })).toBeVisible();
  await expect(page.locator(".ticker-group")).toHaveCount(2);
  const tickerWidths = await page.locator(".ticker-group").evaluateAll(groups => groups.map(group => group.getBoundingClientRect().width));
  expect(tickerWidths[0]).toBeCloseTo(tickerWidths[1], 2);
});

test("home and project index cards share the same media proportions", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/");
  const home = await page.locator(".project-card .project-visual").first().boundingBox();
  await page.goto("/projects");
  const index = await page.locator(".project-index-card .project-visual").first().boundingBox();
  expect(home && index).toBeTruthy();
  expect(home!.width / home!.height).toBeCloseTo(16 / 9, 1);
  expect(index!.width / index!.height).toBeCloseTo(16 / 9, 1);
});

test("database projects are authoritative and expose every admin-managed case-study field", async ({ page }) => {
  const payload = { projects: [{
    id: "project-managed", slug: "managed-project", title: "Managed project", eyebrow: "Admin owned", description: "Managed description",
    problem: "Managed problem", solution: "Managed solution", result: "Managed result", stack: '["React"]', result_metrics: '{"Hours saved":"65%"}',
    screenshot_r2_keys: "[]", image: "/logo.svg", live_url: "https://example.com", demo_flag: 1, demo_note: "Managed mockup note", category: "Software", featured: 1,
  }] };
  await page.addInitScript(data => {
    const nativeFetch = window.fetch.bind(window);
    window.fetch = (input, init) => {
      const value = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
      if (new URL(value, window.location.origin).pathname === "/api/content") return Promise.resolve(new Response(JSON.stringify(data), { status: 200, headers: { "content-type": "application/json" } }));
      return nativeFetch(input, init);
    };
  }, payload);
  await page.goto("/projects");
  await expect(page.locator(".project-index-card")).toHaveCount(1);
  await expect(page.getByText("EventStreamHD", { exact: true })).toHaveCount(0);
  await page.getByRole("link", { name: "Read case study" }).click();
  await expect(page.getByText("65%", { exact: true })).toBeVisible();
  await expect(page.getByText("Hours saved", { exact: true })).toBeVisible();
  await expect(page.locator(".callout")).toContainText("Managed mockup note");
});

test("project previews include accessible glitch and static hover layers", async ({ page }) => {
  await page.goto("/projects");
  const preview = page.locator(".project-index-card .project-visual").first();
  await expect(preview.locator("img")).toHaveCount(2);
  await expect(preview.locator(".project-glitch")).toHaveAttribute("aria-hidden", "true");
  await expect(preview.locator(".project-static")).toHaveAttribute("aria-hidden", "true");
});

test("DAEMON can be repositioned with its drag handle", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop drag behavior becomes a bottom sheet on mobile.");
  await page.goto("/");
  const daemon = page.getByLabel("DAEMON interactive terminal");
  const handle = page.locator(".daemon-bar");
  await expect(handle.locator("strong")).toHaveText("DAEMON");
  const before = await daemon.boundingBox();
  const box = await handle.boundingBox();
  expect(before && box).toBeTruthy();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.mouse.move(box!.x - 110, box!.y - 90, { steps: 5 });
  await page.mouse.up();
  const after = await daemon.boundingBox();
  expect(after && before && Math.abs(after.x - before.x)).toBeGreaterThan(50);
});

test("About portrait keeps hover glitch without a scroll reveal and CV content reflects source documents", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator(".portrait-media > img")).toHaveCount(2);
  await expect(page.locator(".portrait-static")).toHaveCount(1);
  await expect(page.locator(".portrait-media > img").first()).toHaveCSS("animation-name", "none");
  await expect(page.locator(".portrait-glitch")).toHaveCSS("animation-name", "none");
  await page.locator(".portrait-frame").hover();
  await expect(page.locator(".portrait-glitch")).toHaveCSS("animation-name", "portrait-glitch-hover");
  await expect(page.getByText("B.LIS · CGPA 4.6/5.0", { exact: true })).toBeVisible();
  await page.goto("/cv");
  await expect(page.getByText("Digital Marketer & Web Manager", { exact: true })).toBeVisible();
  await expect(page.getByText("Koha ISBD Cataloguing Assistant", { exact: true })).toBeVisible();
  await expect(page.getByText("Best Graduating Student, Library & Information Science", { exact: true })).toBeVisible();
  const download = page.getByRole("link", { name: "Download CV" });
  await expect(download).toHaveCSS("color", "rgb(7, 17, 9)");
  await expect(download).toHaveCSS("background-color", "rgb(74, 222, 128)");
});

test("DAEMON terminal controls minimize, maximize and close", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop window controls are covered by the mobile bottom-sheet behavior.");
  await page.goto("/");
  const daemon = page.getByLabel("DAEMON interactive terminal");
  await page.getByRole("button", { name: "Minimize terminal" }).click();
  await expect(daemon).toHaveClass(/minimized/);
  await page.getByRole("button", { name: "Restore terminal" }).click();
  await page.getByRole("button", { name: "Maximize terminal" }).click();
  await expect(daemon).toHaveClass(/maximized/);
  await page.getByRole("button", { name: "Close terminal" }).click();
  await expect(page.getByRole("button", { name: "Open DAEMON terminal" })).toBeVisible();
});

test("footer uses the public brand credit", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(new RegExp(`© ${new Date().getFullYear()} Build With Duke`))).toBeVisible();
  await expect(page.getByText(/built with/).last()).toContainText("built with");
});

test("contact fast-lane copy and business facts have responsive structure", async ({ page }) => {
  await page.goto("/contact");
  const note = page.locator(".contact-note");
  await expect(note.getByText("Prefer the fast lane?", { exact: true })).toBeVisible();
  await expect(note.getByText("WhatsApp is often the quickest route for a first conversation.", { exact: true })).toBeVisible();
  await expect(note.locator("strong")).toHaveCSS("display", "block");
  const facts = page.locator(".business-facts");
  await expect(facts.getByText("Full-stack web development and AI automation consultancy", { exact: true })).toBeVisible();
  await expect(facts.getByText("Monday–Sunday, 09:00–22:59 GMT/BST", { exact: true })).toBeVisible();
  await expect(facts.getByText("Bank transfer only", { exact: true })).toBeVisible();
});

test("cookie preferences open as a centred dialog and persist", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Cookie preferences" }).click();
  const dialog = page.getByRole("dialog", { name: "Choose what runs" });
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  const viewport = page.viewportSize();
  expect(box && viewport && Math.abs((box.x + box.width / 2) - viewport.width / 2)).toBeLessThan(3);
  await page.getByRole("button", { name: "Reject optional" }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole("button", { name: "Cookie preferences" }).click();
  await expect(page.getByRole("dialog", { name: "Choose what runs" })).toBeVisible();
});

test("authenticated admin uses friendly forms and a rich article editor", async ({ page }) => {
  await page.route("**/api/admin/session", route => route.fulfill({ json: { ok: true, csrf: "test-csrf" } }));
  await page.route("**/api/admin/data?module=*", route => {
    const module = new URL(route.request().url()).searchParams.get("module");
    if (module === "overview") return route.fulfill({ json: { counts: { projects: 1, testimonials: 0, pricing: 0, leads: 0, commands: 0, posts: 0, settings: 0 }, newLeads: 0, draftPosts: 0, publishedPosts: 0, recentLeads: [] } });
    if (module === "projects") return route.fulfill({ json: { rows: [{ id: "project-1", slug: "example", title: "Example project", description: "A real project", category: "Software", stack: "[]", result_metrics: "{}", screenshot_r2_keys: "[]", featured: 0, demo_flag: 0, sort_order: 0 }] } });
    if (module === "settings") return route.fulfill({ json: { rows: [{ id: "setting-guide", key: "visitor_guide_enabled", value: "true" }] } });
    return route.fulfill({ json: { rows: [] } });
  });
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Workspace overview" })).toBeVisible();
  await expect(page.getByLabel("DAEMON interactive terminal")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /DAEMON on admin/ })).toHaveCount(0);
  await page.getByRole("button", { name: /Projects Case studies/ }).click();
  await page.getByRole("button", { name: "Add project" }).click();
  await expect(page.getByLabel("Project title")).toBeVisible();
  await expect(page.getByLabel("Category")).toBeVisible();
  await expect(page.getByText("Feature this project")).toBeVisible();
  await expect(page.getByText("Upload gallery images")).toBeVisible();
  await expect(page.getByLabel("Record JSON")).toHaveCount(0);
  await page.getByRole("button", { name: /Articles Article drafts/ }).click();
  await page.getByRole("button", { name: "Add article" }).click();
  await expect(page.getByText("Upload image")).toBeVisible();
  await expect(page.getByRole("toolbar", { name: "Article formatting" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Bold" })).toBeVisible();
  await expect(page.locator(".rich-editor .tiptap")).toBeVisible();
});

test("admin owns the DAEMON visibility setting", async ({ page }) => {
  await page.route("**/api/admin/session", route => route.fulfill({ json: { ok: true, csrf: "test-csrf" } }));
  await page.route("**/api/admin/data?module=*", route => {
    const module = new URL(route.request().url()).searchParams.get("module");
    if (module === "overview") return route.fulfill({ json: { counts: { settings: 1 }, newLeads: 0, draftPosts: 0, publishedPosts: 0, recentLeads: [] } });
    if (module === "settings") return route.fulfill({ json: { rows: [{ id: "setting-guide", key: "visitor_guide_enabled", value: "true" }] } });
    return route.fulfill({ json: { rows: [] } });
  });
  await page.goto("/admin");
  await page.getByRole("button", { name: /Settings Business details/ }).click();
  await page.getByRole("button", { name: "Edit Show DAEMON terminal" }).click();
  await expect(page.getByRole("heading", { name: "Show DAEMON terminal" })).toBeVisible();
  await expect(page.getByRole("checkbox")).toBeChecked();
});

test("admin turns non-JSON Function failures into an actionable error", async ({ page }) => {
  await page.route("**/api/admin/session", route => route.fulfill({ json: { ok: true, csrf: "test-csrf" } }));
  await page.route("**/api/admin/data?module=overview", route => route.fulfill({ status: 500, contentType: "text/plain", body: "Internal Server Error" }));
  await page.goto("/admin");
  await expect(page.getByRole("alert")).toContainText("Check the Pages Function deployment and D1 migrations.");
  await expect(page.getByText("The admin request failed.", { exact: true })).toHaveCount(0);
});

test("admin exposes structured route, About and CV content without raw JSON", async ({ page }) => {
  await page.route("**/api/admin/session", route => route.fulfill({ json: { ok: true, csrf: "test-csrf" } }));
  await page.route("**/api/admin/data?module=*", route => {
    const module = new URL(route.request().url()).searchParams.get("module");
    if (module === "overview") return route.fulfill({ json: { counts: { pages: 2 }, newLeads: 0, draftPosts: 0, publishedPosts: 0, recentLeads: [] } });
    if (module === "pages") return route.fulfill({ json: { rows: [
      { id: "page-about", slug: "about", name: "About", seo_title: "About Duke", meta_description: "About Duke", content: "{}", sort_order: 50 },
      { id: "page-cv", slug: "cv", name: "CV", seo_title: "Duke CV", meta_description: "Duke CV", content: "{}", sort_order: 70 },
    ] } });
    return route.fulfill({ json: { rows: [] } });
  });
  await page.goto("/admin");
  await page.getByRole("button", { name: /Pages Route copy/ }).click();
  await page.getByRole("button", { name: "Edit About" }).click();
  await expect(page.getByLabel("Hero title")).toHaveValue("Hi, I’m Duke.");
  await expect(page.getByLabel("Profile paragraph 1")).toBeVisible();
  await expect(page.getByLabel("Credential").first()).toBeVisible();
  await expect(page.getByLabel("Record JSON")).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Back to pages" }).click();
  await page.getByRole("button", { name: "Edit CV" }).click();
  await expect(page.getByText("CV builder", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Role").first()).toBeVisible();
  await expect(page.getByText("Upload PDF")).toBeVisible();
});

test("admin exposes free Gmail notifications and configurable autoblogging", async ({ page }) => {
  await page.route("**/api/admin/session", route => route.fulfill({ json: { ok: true, csrf: "test-csrf" } }));
  await page.route("**/api/admin/data?module=overview", route => route.fulfill({ json: { counts: {}, newLeads: 0, draftPosts: 0, publishedPosts: 0, recentLeads: [] } }));
  await page.route("**/api/admin/notifications", route => route.fulfill({ json: { configured: true, provider: "Google Apps Script MailApp", replyMailbox: "buildwithduke@outlook.com" } }));
  await page.route("**/api/admin/autoblog", route => route.fulfill({ json: { configured: { openrouter: true, serpapi: true, scheduler: true }, settings: { id: "primary", enabled: 0, interval_hours: 168, topics: '["AI automation for UK small businesses"]', model: "openrouter/free", search_country: "uk", search_language: "en", publish_mode: "draft", min_words: 900, max_posts_per_month: 4, similarity_threshold: 0.58, next_run_at: null }, runs: [] } }));
  await page.route("**/api/admin/openrouter-models", route => route.fulfill({ json: { models: [{ id: "openrouter/free", name: "OpenRouter Auto (free)", description: "Free router", provider: "openrouter", contextLength: 200000, promptPrice: 0, completionPrice: 0, isFree: true, modality: "text", supportsTools: true }] } }));
  await page.goto("/admin");
  await page.getByRole("button", { name: /Notifications Free Gmail alerts/ }).click();
  await expect(page.getByRole("heading", { name: "Gmail alerts ready" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Gmail in, Outlook out" })).toBeVisible();
  await page.getByRole("button", { name: /Autoblog Research/ }).click();
  await expect(page.getByRole("heading", { name: "Cadence and editorial brief" })).toBeVisible();
  const modelPicker = page.getByRole("button", { name: /openrouter\/free/i });
  await expect(modelPicker).toBeVisible();
  await modelPicker.click();
  await expect(page.getByLabel("Search OpenRouter models")).toBeVisible();
  await expect(page.getByLabel("Filter model provider")).toBeVisible();
  await expect(page.getByRole("option", { name: /OpenRouter Auto/ })).toBeVisible();
  const menuBox = await page.locator(".model-picker-menu").boundingBox();
  const viewport = page.viewportSize();
  expect(menuBox && viewport).toBeTruthy();
  expect(menuBox!.x).toBeGreaterThanOrEqual(0);
  expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(viewport!.width);
  await expect(page.getByText("Draft review is the safest default.", { exact: false })).toBeVisible();
});

test("lead records hand replies off to Outlook without a mailbox API", async ({ page }) => {
  await page.route("**/api/admin/session", route => route.fulfill({ json: { ok: true, csrf: "test-csrf" } }));
  await page.route("**/api/admin/data?module=*", route => {
    const module = new URL(route.request().url()).searchParams.get("module");
    if (module === "overview") return route.fulfill({ json: { counts: { leads: 1 }, newLeads: 1, draftPosts: 0, publishedPosts: 0, recentLeads: [] } });
    if (module === "leads") return route.fulfill({ json: { rows: [{ id: "lead-1", name: "Ada Lovelace", email: "ada@example.com", message: "I would like to discuss a new web project in detail.", status: "new", created_at: "2026-07-19T10:00:00.000Z" }] } });
    return route.fulfill({ json: { rows: [] } });
  });
  await page.goto("/admin");
  await page.getByRole("button", { name: /Leads Enquiries/ }).click();
  await page.locator(".admin-record-main").filter({ hasText: "Ada Lovelace" }).click();
  const reply = page.getByRole("link", { name: "Draft reply in Outlook" });
  await expect(reply).toHaveAttribute("href", /^mailto:ada%40example\.com\?subject=Re%3A%20Your%20Build%20With%20Duke%20enquiry&body=/);
  await expect(page.getByText("No synced messages")).toHaveCount(0);
});

test("published articles appear at the public articles route and render sanitized rich content", async ({ page }) => {
  await page.route("**/api/content", route => route.fulfill({ json: { blogPosts: [{ id: "post-1", slug: "safe-article", title: "A safe article", excerpt: "A useful summary.", body: "<h2>Useful heading</h2><p>Clean <strong>rich text</strong>.</p><script>window.hacked=true</script>", published_at: "2026-07-19T10:00:00.000Z" }] } }));
  await page.goto("/articles");
  const articleLink = page.getByRole("link", { name: "Read article" });
  await expect(articleLink).toHaveAttribute("href", "/articles/safe-article");
  await articleLink.click();
  await expect(page).toHaveURL(/\/articles\/safe-article$/);
  await expect(page.getByRole("heading", { level: 1, name: "A safe article" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Useful heading" })).toBeVisible();
  await expect(page.locator(".blog-prose strong")).toHaveText("rich text");
  await expect(page.locator(".blog-prose script")).toHaveCount(0);
  expect(await page.evaluate(() => (window as typeof window & { hacked?: boolean }).hacked)).toBeUndefined();
});

test("legacy blog links redirect to the canonical articles route", async ({ page }) => {
  await page.goto("/blog/legacy-article");
  await expect(page).toHaveURL(/\/articles\/legacy-article$/);
  await page.goto("/blog");
  await expect(page).toHaveURL(/\/articles$/);
});
