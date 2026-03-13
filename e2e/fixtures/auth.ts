import { expect, Page } from "@playwright/test";

/**
 * Logs in with E2E credentials. Requires E2E_USER_EMAIL and E2E_USER_PASSWORD.
 * Use in beforeAll/beforeEach for admin and destructive specs.
 */
export async function loginAsE2EUser(page: Page): Promise<void> {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;
  if (!email || !password) {
    throw new Error("E2E_USER_EMAIL and E2E_USER_PASSWORD must be set for admin E2E tests");
  }

  await page.goto("/admin/login");
  await page.getByLabel(/email/i).fill(email);
  await page.locator("#login-password").fill(password);
  await page.getByRole("button", { name: /^sign in$/i }).click();
  // Wait for client-side redirect (router.push); expect().toHaveURL polls the URL and does not depend on load event.
  await expect(page).toHaveURL(/\/admin\/(dashboard|notes|projects)/, { timeout: 10000 });
}

export function hasE2ECredentials(): boolean {
  return !!process.env.E2E_USER_EMAIL && !!process.env.E2E_USER_PASSWORD;
}
