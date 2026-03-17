import { expect, test } from "@playwright/test";
import { hasE2ECredentials, loginAsE2EUser } from "./fixtures/auth";
import { createRoadmapItem, deleteRoadmapItem, getRoadmapCenter } from "./fixtures/roadmap";

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

    const center = await getRoadmapCenter(page);

    const item = await createRoadmapItem(page, {
      title: nodeTitle,
      type: "learning",
      position: {
        x: center.x - 40,
        y: center.y - 40,
      },
    });
    createdIds.push(item.id);

    const group = await createRoadmapItem(page, {
      title: groupTitle,
      type: "group",
      position: {
        x: center.x + 40,
        y: center.y + 40,
      },
    });
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
