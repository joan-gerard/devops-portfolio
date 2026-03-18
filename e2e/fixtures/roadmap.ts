import { expect, type Page } from "@playwright/test";

export type RoadmapItemType = "learning" | "project" | "group";

export interface RoadmapItemCreateOptions {
  title: string;
  type?: RoadmapItemType;
  status?: string;
  position?: {
    x: number;
    y: number;
  };
}

export type CreatedRoadmapItem = {
  id: string;
  title: string;
};

export async function getRoadmapCenter(page: Page): Promise<{
  x: number;
  y: number;
}> {
  const res = await page.request.get("/api/roadmap");
  if (!res.ok()) {
    return { x: 120, y: 120 };
  }

  const data = (await res.json()) as {
    items: { position_x: number; position_y: number }[];
  };

  if (!data.items.length) {
    return { x: 120, y: 120 };
  }

  const xs = data.items.map((i) => i.position_x);
  const ys = data.items.map((i) => i.position_y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}

export async function createRoadmapItem(
  page: Page,
  options: RoadmapItemCreateOptions
): Promise<CreatedRoadmapItem> {
  const { title, type = "learning", status = "not_started", position } = options;

  const res = await page.request.post("/api/roadmap", {
    data: {
      title,
      type,
      status,
      position_x: position?.x ?? 80,
      position_y: position?.y ?? 80,
    },
  });

  expect(res.ok()).toBeTruthy();

  const item = (await res.json()) as { id: string; title: string };
  return { id: item.id, title: item.title };
}

export async function patchRoadmapItem(page: Page, id: string, fields: Record<string, unknown>) {
  const res = await page.request.patch(`/api/roadmap/${id}`, { data: fields });
  expect(res.ok()).toBeTruthy();
  return res.json();
}

export async function deleteRoadmapItem(page: Page, id: string) {
  const res = await page.request.delete(`/api/roadmap/${id}`);
  if (!res.ok()) {
    const body = await res.text().catch(() => "<unreadable response body>");
    throw new Error(
      `deleteRoadmapItem failed for id=${id}: ${res.status()} ${res.statusText()}\n${body}`
    );
  }

  expect(res.ok()).toBeTruthy();
}
