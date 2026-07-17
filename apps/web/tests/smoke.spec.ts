import { expect, test } from "@playwright/test";

test("core routes render without page errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("I build things that work");
  await page.goto("/projects");
  await expect(page.getByRole("article")).toHaveCount(9);
  await page.goto("/contact");
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel(/Tell me about it/)).toBeVisible();
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
