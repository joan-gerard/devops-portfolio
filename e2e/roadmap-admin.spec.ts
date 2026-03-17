import { expect, test } from "@playwright/test";
import { hasE2ECredentials, loginAsE2EUser } from "./fixtures/auth";

async function getRoadmapCenter(page: import("@playwright/test").Page): Promise<{
  x: number;
  y: number;
}> {
  const res = await page.request.get("/api/roadmap");
  if (!res.ok()) return { x: 120, y: 120 };
  const data = (await res.json()) as {
    items: { position_x: number; position_y: number }[];
  };
  if (!data.items.length) return { x: 120, y: 120 };

  const xs = data.items.map((i) => i.position_x);
  const ys = data.items.map((i) => i.position_y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}

async function createRoadmapItem(
  page: import("@playwright/test").Page,
  data: { title: string; type: "learning" | "project" | "group" }
) {
  const center = await getRoadmapCenter(page);
  const res = await page.request.post("/api/roadmap", {
    data: {
      title: data.title,
      type: data.type,
      status: "not_started",
      position_x: center.x + (data.type === "group" ? 40 : -40),
      position_y: center.y + (data.type === "group" ? 40 : -40),
    },
  });
  expect(res.ok()).toBeTruthy();
  return (await res.json()) as { id: string; title: string; type: string };
}

async function deleteRoadmapItem(page: import("@playwright/test").Page, id: string) {
  await page.request.delete(`/api/roadmap/${id}`);
}

test.describe("Roadmap (admin)", () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasE2ECredentials(), "E2E credentials required");
    await loginAsE2EUser(page);
  });

  test("edit node title persists and group completion persists with saved indicator", async ({
    page,
  }) => {
    const createdIds: string[] = [];

    const nodeTitle = `E2E Roadmap Admin Node ${Date.now()}`;
    const groupTitle = `E2E Roadmap Admin Group ${Date.now()}`;

    const item = await createRoadmapItem(page, { title: nodeTitle, type: "learning" });
    createdIds.push(item.id);
    const group = await createRoadmapItem(page, { title: groupTitle, type: "group" });
    createdIds.push(group.id);

    await page.goto("/roadmap/edit");
    await expect(page.getByRole("heading", { name: /Roadmap Editor/i })).toBeVisible({
      timeout: 10000,
    });

    // Click node → side panel opens.
    const nodeInCanvas = page.locator(`[data-id="${item.id}"]`).getByText(nodeTitle);
    await expect(nodeInCanvas).toBeVisible({ timeout: 10000 });
    await nodeInCanvas.click();
    await expect(page.getByText(/edit node/i)).toBeVisible();

    // Edit title, blur → observe Saved indicator.
    const newTitle = `${nodeTitle} Updated`;
    const titleInput = page.getByLabel(/^title$/i);
    await titleInput.fill(newTitle);
    await titleInput.blur();

    await expect(page.getByText(/^saved$/i).first()).toBeVisible({ timeout: 12000 });

    // Refresh and confirm persisted title appears on the canvas.
    await page.reload();
    await expect(page.getByText(newTitle).first()).toBeVisible({ timeout: 10000 });

    // Toggle group completion for a group node and confirm it persists.
    const groupInCanvas = page.locator(`[data-id="${group.id}"]`).getByText(groupTitle);
    await groupInCanvas.click();
    await expect(page.getByText(/group completion/i)).toBeVisible();

    // Button text changes based on current state; initial state should offer "Mark group as completed".
    const markCompletedButton = page.getByRole("button", { name: /mark group as completed/i });
    await expect(markCompletedButton).toBeVisible();
    await markCompletedButton.click();

    await expect(page.getByText(/^saved$/i).first()).toBeVisible({ timeout: 12000 });

    // Refresh and re-open group node; it should now show the completed state copy.
    await page.reload();
    await page.getByText(groupTitle).first().click();
    await expect(page.getByText(/marked as completed/i)).toBeVisible({ timeout: 10000 });

    // Cleanup
    await Promise.all(createdIds.map((id) => deleteRoadmapItem(page, id)));
  });
});
