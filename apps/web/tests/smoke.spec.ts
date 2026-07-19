import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
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
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const route of ["/services", "/about", "/pricing", "/cv", "/blog", "/privacy", "/cookies", "/terms", "/projects/files-combiner"]) {
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

test("DAEMON executes a real navigation command", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) await page.getByRole("button", { name: /Daemon/i }).click();
  const command = page.getByLabel("$", { exact: true });
  await command.fill("projects");
  await command.press("Enter");
  await expect(page).toHaveURL(/\/projects$/);
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

test("pricing keeps its values and localizes only the currency symbol", async ({ page }) => {
  await page.route("**/api/currency", route => route.fulfill({ json: { currency: "USD" } }));
  await page.goto("/pricing");
  await expect(page.getByText("$999", { exact: true })).toBeVisible();
  await expect(page.getByText("Showing USD based on your location · values are not converted", { exact: true })).toBeVisible();
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

test("hero typing cursor and logo-only technology ticker render", async ({ page }) => {
  await page.goto("/");
  const output = page.locator(".typing-output");
  await expect(output).toBeVisible();
  const cursor = await output.evaluate(element => getComputedStyle(element, "::after").content);
  expect(cursor).not.toBe("none");
  await expect(page.locator(".stack-ticker")).toBeVisible();
  await expect(page.locator(".ticker-item svg").first()).toBeVisible();
  await expect(page.locator(".ticker-item b")).toHaveCount(0);
  await expect(page.locator(".ticker-group")).toHaveCount(2);
  const tickerWidths = await page.locator(".ticker-group").evaluateAll(groups => groups.map(group => group.getBoundingClientRect().width));
  expect(tickerWidths[0]).toBeCloseTo(tickerWidths[1], 2);
});

test("home and project index cards share the same media proportions", async ({ page }) => {
  await page.goto("/");
  const home = await page.locator(".project-card .project-visual").first().boundingBox();
  await page.goto("/projects");
  const index = await page.locator(".project-index-card .project-visual").first().boundingBox();
  expect(home && index).toBeTruthy();
  expect(home!.width / home!.height).toBeCloseTo(16 / 9, 1);
  expect(index!.width / index!.height).toBeCloseTo(16 / 9, 1);
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

test("About portrait reveals with glitch layers and CV content reflects source documents", async ({ page }) => {
  await page.goto("/about");
  await expect(page.locator(".portrait-media > img")).toHaveCount(2);
  await expect(page.locator(".portrait-static")).toHaveCount(1);
  await expect(page.getByText("B.LIS · CGPA 4.6/5.0", { exact: true })).toBeVisible();
  await page.goto("/cv");
  await expect(page.getByText("Digital Marketer & Web Manager", { exact: true })).toBeVisible();
  await expect(page.getByText("Koha ISBD Cataloguing Assistant", { exact: true })).toBeVisible();
  await expect(page.getByText("Best Graduating Student, Library & Information Science", { exact: true })).toBeVisible();
});

test("DAEMON window controls minimize, maximize and close", async ({ page, isMobile }) => {
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
    return route.fulfill({ json: { rows: [] } });
  });
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Workspace overview" })).toBeVisible();
  await page.getByRole("button", { name: /Projects Case studies/ }).click();
  await page.getByRole("button", { name: "Add project" }).click();
  await expect(page.getByLabel("Project title")).toBeVisible();
  await expect(page.getByLabel("Category")).toBeVisible();
  await expect(page.getByText("Feature this project")).toBeVisible();
  await expect(page.getByLabel("Record JSON")).toHaveCount(0);
  await page.getByRole("button", { name: /Articles Build log/ }).click();
  await page.getByRole("button", { name: "Add article" }).click();
  await expect(page.getByRole("toolbar", { name: "Article formatting" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Bold" })).toBeVisible();
  await expect(page.locator(".rich-editor .tiptap")).toBeVisible();
});

test("published article routes render rich content after sanitizing it", async ({ page }) => {
  await page.route("**/api/content", route => route.fulfill({ json: { blogPosts: [{ id: "post-1", slug: "safe-article", title: "A safe article", excerpt: "A useful summary.", body: "<h2>Useful heading</h2><p>Clean <strong>rich text</strong>.</p><script>window.hacked=true</script>", published_at: "2026-07-19T10:00:00.000Z" }] } }));
  await page.goto("/blog/safe-article");
  await expect(page).toHaveURL(/\/blog\/safe-article$/);
  await expect(page.getByRole("heading", { level: 1, name: "A safe article" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Useful heading" })).toBeVisible();
  await expect(page.locator(".blog-prose strong")).toHaveText("rich text");
  await expect(page.locator(".blog-prose script")).toHaveCount(0);
  expect(await page.evaluate(() => (window as typeof window & { hacked?: boolean }).hacked)).toBeUndefined();
});
