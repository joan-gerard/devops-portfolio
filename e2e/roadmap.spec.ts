import { expect, test } from "@playwright/test";
import { hasE2ECredentials, loginAsE2EUser } from "./fixtures/auth";

type CreatedRoadmapItem = { id: string; title: string };

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

async function createRoadmapItem(
  page: import("@playwright/test").Page,
  data: { title: string; type?: "learning" | "project" | "group"; status?: string }
): Promise<CreatedRoadmapItem> {
  const res = await page.request.post("/api/roadmap", {
    data: {
      title: data.title,
      type: data.type ?? "learning",
      status: data.status ?? "not_started",
      position_x: 80,
      position_y: 80,
    },
  });
  expect(res.ok()).toBeTruthy();
  const item = (await res.json()) as { id: string; title: string };
  return { id: item.id, title: item.title };
}

async function patchRoadmapItem(
  page: import("@playwright/test").Page,
  id: string,
  fields: Record<string, unknown>
) {
  const res = await page.request.patch(`/api/roadmap/${id}`, { data: fields });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

async function deleteRoadmapItem(page: import("@playwright/test").Page, id: string) {
  await page.request.delete(`/api/roadmap/${id}`);
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
    const item = await createRoadmapItem(page, { title: nodeTitle, type: "learning" });
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
