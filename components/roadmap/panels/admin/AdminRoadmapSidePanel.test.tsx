import type { RoadmapItemWithSlug } from "@/types/roadmap";
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
    linked_page_type: null,
    is_group_completed: false,
    completed_at: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  };

  return { ...base, ...overrides };
}

const mockFetch = vi.fn();
const mockClipboardWriteText = vi.fn();
let originalFetch: typeof globalThis.fetch;

describe("AdminRoadmapSidePanel", () => {
  beforeEach(() => {
    originalFetch = globalThis.fetch;
    (globalThis as unknown as { fetch: typeof fetch }).fetch = mockFetch as unknown as typeof fetch;
    Object.defineProperty(globalThis.navigator, "clipboard", {
      value: { writeText: mockClipboardWriteText },
      configurable: true,
    });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.resetAllMocks();
  });

  it("renders nothing when no item is selected", () => {
    render(
      <AdminRoadmapSidePanel
        item={null}
        onClose={() => {}}
        onUpdate={() => {}}
        onDelete={async () => {}}
        onBeginSaving={() => {}}
        onFinishSaving={() => {}}
      />
    );

    expect(screen.queryByText(/Edit node/i)).not.toBeInTheDocument();
  });

  it("updates the title and shows save status", async () => {
    const item = buildItem();
    const updatedItem = buildItem({ title: "Updated title" });
    const onUpdate = vi.fn();
    const onBeginSaving = vi.fn();
    const onFinishSaving = vi.fn();

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
        onBeginSaving={onBeginSaving}
        onFinishSaving={onFinishSaving}
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

    expect(onBeginSaving).toHaveBeenCalledTimes(1);
    expect(onFinishSaving).toHaveBeenCalledWith(true);
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
        onBeginSaving={() => {}}
        onFinishSaving={() => {}}
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

  it("shows linked note/project status as read-only context", () => {
    const noteLinkedItem = buildItem({
      linked_page_slug: "docker-fundamentals",
      linked_page_type: "note",
    });
    const { rerender } = render(
      <AdminRoadmapSidePanel
        item={noteLinkedItem}
        onClose={() => {}}
        onUpdate={() => {}}
        onDelete={async () => {}}
        onBeginSaving={() => {}}
        onFinishSaving={() => {}}
      />
    );

    expect(screen.getByText(/Linked to note:/i)).toBeInTheDocument();
    expect(screen.getByText("/notes/docker-fundamentals")).toBeInTheDocument();

    const projectLinkedItem = buildItem({
      linked_page_slug: "devops-portfolio",
      linked_page_type: "project",
    });
    rerender(
      <AdminRoadmapSidePanel
        item={projectLinkedItem}
        onClose={() => {}}
        onUpdate={() => {}}
        onDelete={async () => {}}
        onBeginSaving={() => {}}
        onFinishSaving={() => {}}
      />
    );
    expect(screen.getByText(/Linked to project:/i)).toBeInTheDocument();
    expect(screen.getByText("/projects/devops-portfolio")).toBeInTheDocument();

    const unlinkedItem = buildItem({ linked_page_slug: null, linked_page_type: null });
    rerender(
      <AdminRoadmapSidePanel
        item={unlinkedItem}
        onClose={() => {}}
        onUpdate={() => {}}
        onDelete={async () => {}}
        onBeginSaving={() => {}}
        onFinishSaving={() => {}}
      />
    );
    expect(screen.getByText(/Not linked to a note or project/i)).toBeInTheDocument();
  });

  it("shows roadmap item ID for learning/project nodes only", () => {
    const learningItem = buildItem({ id: "roadmap-item-123", type: "learning" });
    const { rerender } = render(
      <AdminRoadmapSidePanel
        item={learningItem}
        onClose={() => {}}
        onUpdate={() => {}}
        onDelete={async () => {}}
        onBeginSaving={() => {}}
        onFinishSaving={() => {}}
      />
    );

    const idInput = screen
      .getAllByLabelText(/^Roadmap item ID$/i)
      .find((el) => el.tagName === "INPUT") as HTMLInputElement | undefined;
    expect(idInput).toBeDefined();
    if (!idInput) return;
    expect(idInput).toBeInTheDocument();
    expect(idInput).toHaveValue("roadmap-item-123");
    expect(idInput).toHaveAttribute("readonly");

    const groupItem = buildItem({ id: "group-1", type: "group" });
    rerender(
      <AdminRoadmapSidePanel
        item={groupItem}
        onClose={() => {}}
        onUpdate={() => {}}
        onDelete={async () => {}}
        onBeginSaving={() => {}}
        onFinishSaving={() => {}}
      />
    );

    expect(screen.queryAllByLabelText(/^Roadmap item ID$/i)).toHaveLength(0);
  });

  it("copies roadmap item ID to clipboard", async () => {
    const item = buildItem({ id: "roadmap-item-copy-1", type: "project" });
    mockClipboardWriteText.mockResolvedValue(undefined);

    render(
      <AdminRoadmapSidePanel
        item={item}
        onClose={() => {}}
        onUpdate={() => {}}
        onDelete={async () => {}}
        onBeginSaving={() => {}}
        onFinishSaving={() => {}}
      />
    );

    const copyButton = screen.getByRole("button", { name: /Copy roadmap item ID/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(mockClipboardWriteText).toHaveBeenCalledWith("roadmap-item-copy-1");
    });

    expect(screen.getByRole("button", { name: /Copy roadmap item ID/i })).toHaveTextContent(
      "Copied"
    );
  });
});
