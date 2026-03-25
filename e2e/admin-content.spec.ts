import { expect, test } from "@playwright/test";
import { hasE2ECredentials, loginAsE2EUser } from "./fixtures/auth";

/**
 * E2E: Admin content lifecycle.
 * Create → Edit → Publish → View for notes and projects.
 * Requires E2E_USER_EMAIL and E2E_USER_PASSWORD. Skipped when not set.
 */
test.describe("Admin content lifecycle", () => {
  test.beforeEach(async ({ page }) => {
    if (!hasE2ECredentials()) return;
    await loginAsE2EUser(page);
  });

  test("note: create → edit → publish → visible on public URL", async ({ page }) => {
    test.skip(!hasE2ECredentials(), "E2E credentials required");

    await page.goto("/admin/notes");
    await page.getByRole("button", { name: /new note/i }).click();
    await expect(page).toHaveURL(/\/admin\/editor\/[\w-]+/, { timeout: 10000 });

    const title = `E2E Note ${Date.now()}`;
    await page.getByLabel(/note title/i).fill(title);
    await page.getByLabel(/note title/i).blur();
    await expect(page.getByText(/saving|saved|save failed/i)).toBeVisible({ timeout: 12000 });

    await page.getByRole("button", { name: /from title/i }).click();
    await expect(page.getByText(/title slug saved/i)).toBeVisible({ timeout: 12000 });

    await page.getByRole("button", { name: /^publish$/i }).click();
    await page.waitForResponse(
      (res) =>
        /\/api\/pages\/[\w-]+$/.test(new URL(res.url()).pathname) &&
        res.request().method() === "PATCH" &&
        res.status() === 200
    );
    await expect(page.getByRole("button", { name: /published/i })).toBeVisible({ timeout: 5000 });

    const noteSlug = (await page.getByLabel("Note URL slug").inputValue()).trim();
    await page.goto(`/notes/${noteSlug}`);
    await expect(page).toHaveURL(`/notes/${noteSlug}`);
    await expect(
      page
        .getByRole("heading")
        .filter({ hasText: /E2E Note \d+|Untitled Note/ })
        .first()
    ).toBeVisible({ timeout: 20000 });
  });

  test("project: create → edit → publish → visible on public URL with links", async ({ page }) => {
    test.skip(!hasE2ECredentials(), "E2E credentials required");

    await page.goto("/admin/projects");
    await page
      .getByRole("region", { name: /your projects/i })
      .getByRole("button", { name: /new project/i })
      .click();
    await expect(page).toHaveURL(/\/admin\/projects\/[\w-]+/, { timeout: 10000 });

    const title = `E2E Project ${Date.now()}`;
    // Fill title first and wait for save: the form uses a single debounce timer,
    // so filling other fields afterward would cancel the title save.
    await page.getByLabel(/project title/i).fill(title);
    await page.getByLabel(/project title/i).blur();
    await expect(page.getByText(/saving|saved|save failed/i)).toBeVisible({ timeout: 12000 });

    // Form uses a single debounce (1s). Wait for debounce + request so each field's PATCH runs.
    // Use a larger buffer under full-suite load so saves complete before we proceed.
    const DEBOUNCE_MS = 1000;
    const SAVE_BUFFER_MS = 2500;
    async function waitForFieldSave() {
      await page.waitForTimeout(DEBOUNCE_MS + SAVE_BUFFER_MS);
      await expect(page.getByText(/Saved|Save failed/)).toBeVisible({ timeout: 8000 });
    }
    await page.getByLabel(/project description/i).fill("E2E test description.");
    await waitForFieldSave();
    await page.getByLabel(/github url/i).fill("https://github.com/example/repo");
    await waitForFieldSave();
    await page.getByLabel(/live url/i).fill("https://example.com");
    await waitForFieldSave();

    await page.getByRole("button", { name: /^publish$/i }).click();
    await page.waitForResponse(
      (res) =>
        /\/api\/projects\/[\w-]+$/.test(new URL(res.url()).pathname) &&
        res.request().method() === "PATCH" &&
        res.status() === 200
    );
    await expect(page.getByRole("button", { name: /published/i })).toBeVisible({ timeout: 5000 });

    const projectSlug = (await page.getByLabel("Project URL slug").inputValue()).trim();
    await page.goto(`/projects/${projectSlug}`);
    await expect(page).toHaveURL(`/projects/${projectSlug}`);
    await expect(page.getByRole("heading", { name: title })).toBeVisible({ timeout: 20000 });
    const main = page.getByRole("main");
    await expect(main.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      /github\.com/,
      { timeout: 8000 }
    );
    await expect(main.getByRole("link", { name: /live/i })).toHaveAttribute(
      "href",
      /example\.com/,
      { timeout: 8000 }
    );
  });
});
