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
  await expect(page.getByText(/Unconventional Soccer/i)).toHaveCount(0);
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
  if (isMobile) await page.getByRole("button", { name: /DAEMON/ }).click();
  const command = page.getByLabel("$", { exact: true });
  await command.fill("projects");
  await command.press("Enter");
  await expect(page).toHaveURL(/\/projects$/);
});

test("brand assets and updated Growth pricing are rendered", async ({ page }) => {
  await page.goto("/pricing");
  await expect(page.locator(".logo img").first()).toHaveAttribute("src", "/logo.png");
  await expect(page.getByText("£999", { exact: true })).toBeVisible();
});

test("hero typing cursor and logo-only technology ticker render", async ({ page }) => {
  await page.goto("/");
  const output = page.locator(".typing-output");
  await expect(output).toBeVisible();
  const cursor = await output.evaluate(element => getComputedStyle(element, "::after").content);
  expect(cursor).not.toBe("none");
  await expect(page.locator(".ticker-item svg").first()).toBeVisible();
  await expect(page.locator(".ticker-item b")).toHaveCount(0);
});

test("DAEMON can be repositioned with its drag handle", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop drag behavior becomes a bottom sheet on mobile.");
  await page.goto("/");
  const daemon = page.getByLabel("DAEMON interactive terminal");
  const handle = page.getByRole("button", { name: /Move DAEMON terminal/ });
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
