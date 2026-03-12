import { expect, test } from "@playwright/test";

/**
 * E2E: Public read-only flows.
 * Visit home, notes, projects; follow links to detail pages; tag filter on notes; 404 handling.
 * No authentication required.
 */
test.describe("Public read-only flows", () => {
  test("home page shows recent notes and featured projects sections", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/DevOps Learning Portal/i);

    // Section headings (may have empty state or content)
    await expect(page.getByRole("heading", { name: /what i've been writing/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /what i've been building/i })).toBeVisible();

    // Links to full lists
    await expect(page.getByRole("link", { name: /all notes/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /all projects/i })).toBeVisible();
  });

  test("clicking project card Details goes to project detail page", async ({ page }) => {
    await page.goto("/");
    const detailsLink = page.getByRole("link", { name: /details/i }).first();
    const count = await detailsLink.count();
    if (count === 0) {
      // No published projects: go to /projects and try first card there
      await page.goto("/projects");
      const cardLink = page.getByRole("link", { name: /details/i }).first();
      if ((await cardLink.count()) === 0) {
        test.skip();
        return;
      }
      await cardLink.click();
    } else {
      await detailsLink.click();
    }
    await expect(page).toHaveURL(/\/projects\/[\w-]+/);
    await expect(page).toHaveTitle(/— DevOps Learning Portal/);
  });

  test("visit /notes shows list or empty state", async ({ page }) => {
    await page.goto("/notes");
    await expect(page).toHaveTitle(/Notes — DevOps Learning Portal/i);
    // Notes page has h1 "What I've been learning" or empty state "No notes published yet"
    const heading = page.getByRole("heading", { name: /what i've been learning/i });
    const empty = page.getByText(/no notes published/i);

    let sawHeading = false;
    try {
      await expect(heading).toBeVisible({ timeout: 2000 });
      sawHeading = true;
    } catch {
      // If heading doesn't become visible, fall back to expecting the empty state.
      await expect(empty).toBeVisible({ timeout: 2000 });
    }

    expect(sawHeading || (await empty.isVisible())).toBeTruthy();
  });

  test("clicking a note goes to note detail page", async ({ page }) => {
    await page.goto("/notes");
    const noteLink = page.locator('a[href^="/notes/"]').first();
    if ((await noteLink.count()) === 0) {
      test.skip();
      return;
    }
    await noteLink.click();
    await expect(page).toHaveURL(/\/notes\/[\w-]+/);
    await expect(page).toHaveTitle(/— DevOps Learning Portal/);
  });

  // Will be skipped if there are no tags, ie no published notes with tags
  test("tag filter changes visible notes on /notes", async ({ page }) => {
    await page.goto("/notes");
    // If there's an "all" tag button, tags exist
    const allButton = page.getByRole("button", { name: /^all$/i });
    if (!(await allButton.isVisible())) {
      test.skip();
      return;
    }
    await allButton.click();
    // Click first tag if present (other than "all") within the tag filter bar
    const tagButtons = page
      .getByTestId("notes-tag-filter")
      .getByRole("button")
      .filter({ hasNotText: /^all$/i });
    const tagCount = await tagButtons.count();
    if (tagCount === 0) {
      test.skip();
      return;
    }
    await tagButtons.first().click();
    // Filter is applied: result count for the active tag is visible
    await expect(page.getByText(/note[s]? tagged/i)).toBeVisible();
    // We stay on the notes listing URL
    await expect(page).toHaveURL("/notes");
  });

  test("visit /projects shows list or empty state", async ({ page }) => {
    await page.goto("/projects");
    await expect(page).toHaveTitle(/Projects — DevOps Learning Portal/i);
    const hasEmpty = await page.getByText(/no projects published/i).isVisible();
    const hasCard = (await page.getByRole("link", { name: /details/i }).count()) > 0;
    expect(hasEmpty || hasCard).toBeTruthy();
  });

  test("404 or invalid slug shows not found", async ({ page }) => {
    await page.goto("/notes/nonexistent-note-slug-404");
    await expect(page.getByText(/not found|404/i)).toBeVisible({ timeout: 5000 });
  });

  test("nonexistent project slug shows not found", async ({ page }) => {
    await page.goto("/projects/nonexistent-project-slug-404");
    await expect(page.getByText(/not found|404/i)).toBeVisible({ timeout: 5000 });
  });
});
