import { vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useEditorPage } from "./useEditorPage";
import type { Page } from "@/types/pages";

const mockNote: Page = {
  id: "note-1",
  title: "Initial Title",
  slug: "initial-slug",
  tags: [],
  published: false,
  updated_at: "2024-01-01T00:00:00Z",
};

describe("useEditorPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(global, "fetch").mockResolvedValue({ ok: true } as Response);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("returns note title, slug, published and idle save status", () => {
      const { result } = renderHook(() => useEditorPage(mockNote));
      expect(result.current.title).toBe("Initial Title");
      expect(result.current.slug).toBe("initial-slug");
      expect(result.current.published).toBe(false);
      expect(result.current.saveStatus).toBe("idle");
      expect(result.current.statusLabel).toBe("");
      expect(result.current.statusColor).toBe("var(--text-muted)");
    });
  });

  describe("status color and label", () => {
    it("maps saveStatus to statusColor and statusLabel", () => {
      const { result } = renderHook(() => useEditorPage(mockNote));
      expect(result.current.statusColor).toBe("var(--text-muted)");
      expect(result.current.statusLabel).toBe("");

      act(() => result.current.setSaveStatus("saving"));
      expect(result.current.statusColor).toBe("var(--yellow)");
      expect(result.current.statusLabel).toBe("Saving…");

      act(() => result.current.setSaveStatus("saved"));
      expect(result.current.statusColor).toBe("var(--accent)");
      expect(result.current.statusLabel).toBe("Saved");

      act(() => result.current.setSaveStatus("error"));
      expect(result.current.statusColor).toBe("var(--red)");
      expect(result.current.statusLabel).toBe("Save failed");
    });
  });

  describe("debounced title save", () => {
    it("updates local title immediately and PATCHes after debounce", async () => {
      const { result } = renderHook(() => useEditorPage(mockNote));

      act(() => result.current.handleTitleChange("New Title"));
      expect(result.current.title).toBe("New Title");
      expect(result.current.saveStatus).toBe("idle");
      expect(global.fetch).not.toHaveBeenCalled();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      await act(async () => {
        await Promise.resolve();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/pages/note-1",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "New Title" }),
        })
      );
      expect(result.current.saveStatus).toBe("saved");
    });

    it("sets saving then error when PATCH fails", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: false } as Response);
      const { result } = renderHook(() => useEditorPage(mockNote));

      act(() => result.current.handleTitleChange("Bad Title"));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.saveStatus).toBe("error");
    });
  });

  describe("debounced slug save", () => {
    it("updates local slug and PATCHes after debounce", async () => {
      const { result } = renderHook(() => useEditorPage(mockNote));

      act(() => result.current.handleSlugChange("new-slug"));
      expect(result.current.slug).toBe("new-slug");

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      await act(async () => {
        await Promise.resolve();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/pages/note-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ slug: "new-slug" }),
        })
      );
      expect(result.current.saveStatus).toBe("saved");
    });
  });

  describe("toggle published", () => {
    it("toggles published and PATCHes immediately (no debounce)", async () => {
      const { result } = renderHook(() => useEditorPage(mockNote));

      await act(async () => {
        result.current.togglePublished();
      });
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.published).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/pages/note-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ published: true }),
        })
      );
      expect(result.current.saveStatus).toBe("saved");
    });

    it("reverts published and sets error when PATCH fails", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: false } as Response);
      const { result } = renderHook(() => useEditorPage({ ...mockNote, published: true }));

      await act(async () => {
        result.current.togglePublished();
      });
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.published).toBe(true);
      expect(result.current.saveStatus).toBe("error");
    });
  });

  describe("roadmap linking", () => {
    it("links a roadmap item and stores its status", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "in_progress", title: "Roadmap node title" }),
      } as Response);
      const { result } = renderHook(() => useEditorPage(mockNote));

      act(() => result.current.setRoadmapItemId("33333333-3333-3333-3333-333333333333"));
      await act(async () => {
        await result.current.saveRoadmapLink(result.current.roadmapItemId);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/roadmap/33333333-3333-3333-3333-333333333333",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ linked_page_id: "note-1" }),
        })
      );
      expect(result.current.roadmapStatus).toBe("in_progress");
      expect(result.current.roadmapTitle).toBe("Roadmap node title");
      expect(result.current.saveStatus).toBe("saved");
    });
  });
});
