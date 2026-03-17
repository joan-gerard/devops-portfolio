import type { RoadmapItemWithSlug } from "@/lib/queries/roadmap";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AdminRoadmapSidePanel } from "./AdminRoadmapSidePanel";

function buildItem(overrides: Partial<RoadmapItemWithSlug> = {}): RoadmapItemWithSlug {
  const base: RoadmapItemWithSlug = {
    id: "item-1",
    title: "Original title",
    description: "Original description",
    type: "learning",
    status: "not_started",
    position_x: 0,
    position_y: 0,
    linked_page_id: null,
    linked_page_slug: null,
    is_group_completed: false,
    completed_at: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  };

  return { ...base, ...overrides };
}

const mockFetch = vi.fn();

describe("AdminRoadmapSidePanel", () => {
  beforeEach(() => {
    (globalThis as unknown as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("renders nothing when no item is selected", () => {
    render(
      <AdminRoadmapSidePanel
        item={null}
        onClose={() => {}}
        onUpdate={() => {}}
        onDelete={async () => {}}
      />
    );

    expect(screen.queryByText(/Edit node/i)).not.toBeInTheDocument();
  });

  it("updates the title and shows save status", async () => {
    const item = buildItem();
    const updatedItem = buildItem({ title: "Updated title" });
    const onUpdate = vi.fn();
    const onSaveStatusChange = vi.fn();

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => updatedItem,
    } as Response);

    render(
      <AdminRoadmapSidePanel
        item={item}
        onClose={() => {}}
        onUpdate={onUpdate}
        onDelete={async () => {}}
        onSaveStatusChange={onSaveStatusChange}
      />
    );

    const input = screen.getByLabelText(/Title/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Updated title" } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/roadmap/${item.id}`,
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "Updated title" }),
        })
      );
    });

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(updatedItem);
    });

    expect(onSaveStatusChange).toHaveBeenCalledWith("saving");
    expect(onSaveStatusChange).toHaveBeenCalledWith("saved");
  });

  it("toggles group completion for group nodes", async () => {
    const item = buildItem({ type: "group", is_group_completed: false });
    const updatedItem = buildItem({ ...item, is_group_completed: true });

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => updatedItem,
    } as Response);

    const onUpdate = vi.fn();

    render(
      <AdminRoadmapSidePanel
        item={item}
        onClose={() => {}}
        onUpdate={onUpdate}
        onDelete={async () => {}}
      />
    );

    const toggle = screen.getByRole("button", { name: /Mark group as completed/i });
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/roadmap/${item.id}`,
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_group_completed: true }),
        })
      );
    });

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(updatedItem);
    });
  });

  it("sends null linked_page_id when input is cleared", async () => {
    const item = buildItem({ linked_page_id: "abc-123" });
    const updatedItem = buildItem({ linked_page_id: null });

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => updatedItem,
    } as Response);

    const onUpdate = vi.fn();

    render(
      <AdminRoadmapSidePanel
        item={item}
        onClose={() => {}}
        onUpdate={onUpdate}
        onDelete={async () => {}}
      />
    );

    const input = screen.getByPlaceholderText(/paste page uuid/i) as HTMLInputElement;
    expect(input.value).toBe(item.linked_page_id);

    fireEvent.change(input, { target: { value: "" } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        `/api/roadmap/${item.id}`,
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linked_page_id: null }),
        })
      );
    });
  });
});
