import { expect, test } from "@playwright/test";

/**
 * E2E: Authentication flows.
 * - Failed login shows error message (from submitLogin mapping).
 * - Successful login redirects to admin dashboard (when E2E credentials are set).
 * - Unauthenticated access to admin redirects to login.
 *
 * To run successful-login test: set E2E_USER_EMAIL and E2E_USER_PASSWORD in the environment.
 */
const hasE2ECredentials = !!process.env.E2E_USER_EMAIL && !!process.env.E2E_USER_PASSWORD;

test.describe("Authentication flows", () => {
  test("failed login shows error message", async ({ page }) => {
    await page.goto("/admin/login");
    await expect(page.getByRole("heading", { name: /admin/i })).toBeVisible();

    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.locator("#login-password").fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Error is shown in role="alert". Expect "Invalid email or password", rate-limit, or generic "Sign-in is temporarily unavailable".
    await expect(
      page.getByRole("alert").filter({
        hasText:
          /invalid|sign in failed|too many|credentials|email and password|temporarily unavailable/i,
      })
    ).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("successful login redirects to admin dashboard", async ({ page }) => {
    test.skip(!hasE2ECredentials, "E2E_USER_EMAIL and E2E_USER_PASSWORD must be set");

    await page.goto("/admin/login");
    await page.getByLabel(/email/i).fill(process.env.E2E_USER_EMAIL!);
    await page.locator("#login-password").fill(process.env.E2E_USER_PASSWORD!);
    await page.getByRole("button", { name: /^sign in$/i }).click();

    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 10000 });
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible({ timeout: 5000 });
  });

  test("unauthenticated visit to admin dashboard redirects to login", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("unauthenticated visit to admin notes redirects to login", async ({ page }) => {
    await page.goto("/admin/notes");
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  test("unauthenticated visit to admin projects redirects to login", async ({ page }) => {
    await page.goto("/admin/projects");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
