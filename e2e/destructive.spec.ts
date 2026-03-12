import { expect, Page, test } from "@playwright/test";
import { hasE2ECredentials, loginAsE2EUser } from "./fixtures/auth";

/**
 * E2E: Destructive operations.
 * Delete note/project: confirm dialog appears; cancel leaves content; confirm removes item.
 * Requires E2E_USER_EMAIL and E2E_USER_PASSWORD. Skipped when not set.
 */
test.describe("Destructive operations", () => {
  test.beforeEach(async ({ page }) => {
    if (!hasE2ECredentials()) return;
    await loginAsE2EUser(page);
  });

  async function createPublishedNote(page: Page) {
    await page.goto("/admin/notes");
    await page.getByRole("button", { name: /new note/i }).click();
    await expect(page).toHaveURL(/\/admin\/editor\/[\w-]+/);

    const title = `E2E Destructive Note ${Date.now()}`;
    const titleInput = page.getByLabel(/note title/i);
    await titleInput.fill(title);
    await titleInput.blur();
    await expect(page.getByText(/saving|saved|save failed/i)).toBeVisible({ timeout: 12000 });

    await page.getByRole("button", { name: /^publish$/i }).click();
    await page.waitForResponse(
      (res) =>
        /\/api\/pages\/[\w-]+$/.test(new URL(res.url()).pathname) &&
        res.request().method() === "PATCH" &&
        res.status() === 200
    );
    await expect(page.getByRole("button", { name: /published/i })).toBeVisible({ timeout: 5000 });

    const noteSlug = (await page.getByLabel("Note URL slug").inputValue()).trim();

    return { title, noteSlug };
  }

  async function waitForNoteVisibleInList(page: Page, title: string, shouldExist: boolean) {
    await page.goto("/notes");
    const locator = page.locator('a[href^="/notes/"]').filter({ hasText: title });
    await expect(locator).toHaveCount(shouldExist ? 1 : 0, { timeout: 20000 });
  }

  test("delete note: cancel leaves content unchanged", async ({ page }) => {
    test.skip(!hasE2ECredentials(), "E2E credentials required");

    const { title } = await createPublishedNote(page);

    await page.getByRole("button", { name: /^delete$/i }).click();
    await expect(page.getByText("Sure?")).toBeVisible();
    await page.getByRole("button", { name: /^cancel$/i }).click();
    await expect(page.getByText("Sure?")).not.toBeVisible();
    await expect(page.getByRole("button", { name: /^delete$/i })).toBeVisible();

    await page.goto("/admin/notes");
    await expect(page.getByText(title)).toBeVisible();
    await waitForNoteVisibleInList(page, title, true);
  });

  test("delete note: confirm removes from admin list and public", async ({ page }) => {
    test.skip(!hasE2ECredentials(), "E2E credentials required");

    const { title } = await createPublishedNote(page);

    await waitForNoteVisibleInList(page, title, true);

    await page.goto("/admin/notes");
    await page.getByText(title).first().click();
    await expect(page).toHaveURL(/\/admin\/editor\//);

    await page.getByRole("button", { name: /^delete$/i }).click();
    await expect(page.getByText("Sure?")).toBeVisible();
    await page
      .getByRole("button", { name: /^delete$/i })
      .filter({ hasText: /^Delete$/ })
      .click();
    await expect(page).toHaveURL("/admin/notes", { timeout: 10000 });
    await expect(page.getByText(title)).not.toBeVisible();

    await waitForNoteVisibleInList(page, title, false);
  });

  async function createPublishedProject(page: Page) {
    await page.goto("/admin/projects");
    await page.getByRole("button", { name: /new project/i }).click();
    await expect(page).toHaveURL(/\/admin\/projects\/[\w-]+/, { timeout: 10000 });

    const title = `E2E Destructive Project ${Date.now()}`;
    const titleInput = page.getByLabel(/project title/i);
    await titleInput.fill(title);
    await titleInput.blur();
    await expect(page.getByText(/saving|saved|save failed/i)).toBeVisible({ timeout: 12000 });

    const DEBOUNCE_MS = 1000;
    const SAVE_BUFFER_MS = 2500;
    await page.waitForTimeout(DEBOUNCE_MS + SAVE_BUFFER_MS);
    await expect(page.getByText(/Saved|Save failed/)).toBeVisible({ timeout: 8000 });

    await page.getByRole("button", { name: /^publish$/i }).click();
    await expect(page.getByRole("button", { name: /published/i })).toBeVisible({ timeout: 5000 });

    const projectSlug = await page.getByLabel("Project URL slug").inputValue();

    return { title, projectSlug };
  }

  async function waitForProjectVisibleInList(page: Page, title: string, shouldExist: boolean) {
    await page.goto("/projects");
    const heading = page.getByRole("heading", { name: title });
    await expect(heading).toHaveCount(shouldExist ? 1 : 0, { timeout: 20000 });
  }

  test("delete project: cancel leaves content unchanged", async ({ page }) => {
    test.skip(!hasE2ECredentials(), "E2E credentials required");

    const { title } = await createPublishedProject(page);

    await page.getByRole("button", { name: /^delete$/i }).click();
    await expect(page.getByText("Sure?")).toBeVisible();
    await page.getByRole("button", { name: /^cancel$/i }).click();
    await expect(page.getByText("Sure?")).not.toBeVisible();
    await expect(page.getByRole("button", { name: /^delete$/i })).toBeVisible();

    await page.goto("/admin/projects");
    await expect(page.getByText(title)).toBeVisible();
    await waitForProjectVisibleInList(page, title, true);
  });

  test("delete project: confirm removes from admin list and public", async ({ page }) => {
    test.skip(!hasE2ECredentials(), "E2E credentials required");

    const { title, projectSlug } = await createPublishedProject(page);

    await page.goto("/admin/projects");
    await page.getByText(title).first().click();
    await expect(page).toHaveURL(/\/admin\/projects\/[\w-]+/, { timeout: 10000 });
    await page.getByRole("button", { name: /^delete$/i }).click();
    await expect(page.getByText("Sure?")).toBeVisible();
    await page
      .getByRole("button", { name: /^delete$/i })
      .filter({ hasText: /^Delete$/ })
      .click();
    await expect(page).toHaveURL("/admin/projects", { timeout: 10000 });
    await expect(page.getByText(title)).not.toBeVisible();

    await page.goto("/projects");
    if (projectSlug) {
      await expect(page.locator(`a[href="/projects/${projectSlug}"]`)).toHaveCount(0, {
        timeout: 20000,
      });
    }
  });
});
