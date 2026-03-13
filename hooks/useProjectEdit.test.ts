import { vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useProjectEdit } from "./useProjectEdit";
import type { Project } from "@/types/projects";

const mockProject: Project = {
  id: "project-1",
  title: "Initial Project",
  slug: "initial-project",
  description: "Initial description",
  tech_stack: [],
  github_url: null,
  live_url: null,
  published: false,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

describe("useProjectEdit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(global, "fetch").mockResolvedValue({ ok: true } as Response);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("initial state", () => {
    it("returns project fields, published, and idle save status", () => {
      const { result } = renderHook(() => useProjectEdit(mockProject));
      expect(result.current.fields.title).toBe("Initial Project");
      expect(result.current.fields.slug).toBe("initial-project");
      expect(result.current.fields.description).toBe("Initial description");
      expect(result.current.published).toBe(false);
      expect(result.current.saveStatus).toBe("idle");
      expect(result.current.statusLabel).toBe("");
      expect(result.current.statusColour).toBe("var(--text-muted)");
    });
  });

  describe("status colour and label", () => {
    it("maps saveStatus to statusColour and statusLabel", () => {
      const { result } = renderHook(() => useProjectEdit(mockProject));

      act(() => result.current.setSaveStatus("saving"));
      expect(result.current.statusColour).toBe("var(--yellow)");
      expect(result.current.statusLabel).toBe("Saving…");

      act(() => result.current.setSaveStatus("saved"));
      expect(result.current.statusColour).toBe("var(--accent)");
      expect(result.current.statusLabel).toBe("Saved");

      act(() => result.current.setSaveStatus("error"));
      expect(result.current.statusColour).toBe("var(--red)");
      expect(result.current.statusLabel).toBe("Save failed");

      act(() => result.current.setSaveStatus("slugSaving"));
      expect(result.current.statusColour).toBe("var(--yellow)");
      expect(result.current.statusLabel).toBe("Saving slug…");

      act(() => result.current.setSaveStatus("slugSaved"));
      expect(result.current.statusColour).toBe("var(--accent)");
      expect(result.current.statusLabel).toBe("Title slug saved");
    });
  });

  describe("debounced field save", () => {
    it("updates local field immediately and PATCHes after debounce", async () => {
      const { result } = renderHook(() => useProjectEdit(mockProject));

      act(() => result.current.handleChange("title", "New Title"));
      expect(result.current.fields.title).toBe("New Title");
      expect(result.current.saveStatus).toBe("idle");
      expect(global.fetch).not.toHaveBeenCalled();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      await act(async () => {
        await Promise.resolve();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/projects/project-1",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "New Title" }),
        })
      );
      expect(result.current.saveStatus).toBe("saved");
    });

    it("sets error when PATCH fails", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: false } as Response);
      const { result } = renderHook(() => useProjectEdit(mockProject));

      act(() => result.current.handleChange("slug", "new-slug"));

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.saveStatus).toBe("error");
    });
  });

  describe("handleSlugRegenerate", () => {
    it("updates slug and PATCHes with slugSaving then slugSaved after debounce", async () => {
      const { result } = renderHook(() => useProjectEdit(mockProject));

      act(() => result.current.handleSlugRegenerate("my-new-slug"));
      expect(result.current.fields.slug).toBe("my-new-slug");
      expect(result.current.saveStatus).toBe("idle");
      expect(global.fetch).not.toHaveBeenCalled();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      await act(async () => {
        await Promise.resolve();
      });

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/projects/project-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ slug: "my-new-slug" }),
        })
      );
      expect(result.current.saveStatus).toBe("slugSaved");
    });

    it("sets error when slug PATCH fails", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: false } as Response);
      const { result } = renderHook(() => useProjectEdit(mockProject));

      act(() => result.current.handleSlugRegenerate("failing-slug"));
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.saveStatus).toBe("error");
    });
  });

  describe("toggle published", () => {
    it("toggles published and PATCHes immediately (no debounce)", async () => {
      const { result } = renderHook(() => useProjectEdit(mockProject));

      await act(async () => {
        await result.current.togglePublished();
      });

      expect(result.current.published).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/projects/project-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ published: true }),
        })
      );
      expect(result.current.saveStatus).toBe("saved");
    });

    it("reverts published and sets error when PATCH fails", async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({ ok: false } as Response);
      const { result } = renderHook(() => useProjectEdit({ ...mockProject, published: true }));

      await act(async () => {
        await result.current.togglePublished();
      });

      expect(result.current.published).toBe(true);
      expect(result.current.saveStatus).toBe("error");
    });
  });
});
