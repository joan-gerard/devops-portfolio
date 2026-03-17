import { expect, test } from "@playwright/test";
import { hasE2ECredentials, loginAsE2EUser } from "./fixtures/auth";
import { createRoadmapItem, deleteRoadmapItem, patchRoadmapItem } from "./fixtures/roadmap";

async function createE2ENote(page: import("@playwright/test").Page) {
  const slug = `e2e-roadmap-note-${Date.now()}`;
  const title = `E2E Roadmap Note ${Date.now()}`;

  const createRes = await page.request.post("/api/pages", {
    data: { title, slug, tags: ["e2e", "roadmap"] },
  });
  expect(createRes.ok()).toBeTruthy();
  const note = (await createRes.json()) as { id: string; slug: string };

  const publishRes = await page.request.patch(`/api/pages/${note.id}`, {
    data: { published: true },
  });
  expect(publishRes.ok()).toBeTruthy();

  return { id: note.id, slug: note.slug, title };
}

test.describe("Roadmap (public)", () => {
  test("open /roadmap, canvas loads, node toggles side panel, and linked node navigates", async ({
    page,
  }) => {
    test.skip(
      !hasE2ECredentials(),
      "E2E credentials required to create deterministic roadmap data"
    );

    // Setup data as an authenticated user, then clear cookies to simulate public view.
    await loginAsE2EUser(page);

    const createdIds: string[] = [];
    const note = await createE2ENote(page);

    const nodeTitle = `E2E Roadmap Linked Node ${Date.now()}`;
    const item = await createRoadmapItem(page, {
      title: nodeTitle,
      type: "learning",
      position: { x: 80, y: 80 },
    });
    createdIds.push(item.id);

    await patchRoadmapItem(page, item.id, { linked_page_id: note.id });

    // Switch to public user (no auth)
    await page.context().clearCookies();

    await page.goto("/roadmap");
    await expect(page).toHaveTitle(/Roadmap/i);

    // Canvas loads: the public page renders the canvas container and React Flow mounts.
    await expect(page.locator("#roadmap-canvas-container")).toBeVisible();
    await expect(page.locator("#roadmap-canvas-container .react-flow")).toBeVisible({
      timeout: 10000,
    });

    const canvas = page.locator("#roadmap-canvas-container");
    const nodeInCanvas = canvas.getByText(nodeTitle).first();
    await expect(nodeInCanvas).toBeVisible({ timeout: 10000 });

    // Click node → side panel opens.
    await nodeInCanvas.click();
    const closeButton = page.getByLabel("Close panel");
    await expect(closeButton).toBeVisible();
    await expect(page.getByRole("heading", { name: nodeTitle })).toBeVisible();

    // Close the panel (Escape works reliably; backdrop covers canvas clicks).
    await page.keyboard.press("Escape");
    await expect(closeButton).not.toBeVisible();

    // Open again and verify the linked navigation action exists and works.
    await nodeInCanvas.click();
    const viewNoteButton = page.getByRole("button", { name: /view note/i });
    await expect(viewNoteButton).toBeVisible();

    await viewNoteButton.click();
    await expect(page).toHaveURL(`/notes/${note.slug}`);
    await expect(page.getByRole("heading", { name: note.title })).toBeVisible({ timeout: 20000 });

    // Cleanup: log in again to delete created roadmap item (notes are cleaned by global teardown).
    await loginAsE2EUser(page);
    await Promise.all(createdIds.map((id) => deleteRoadmapItem(page, id)));
  });
});
