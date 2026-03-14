import { slugify } from "@/lib/slugify";
import { fireEvent, render, screen, waitFor } from "@/test/test-utils";
import { CreateEntityButton } from "./CreateEntityButton";
import { vi, type MockInstance } from "vitest";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/lib/slugify", () => ({
  slugify: vi.fn((value: string) => value.toLowerCase().replace(/\s+/g, "-")),
}));

describe("CreateEntityButton", () => {
  let fetchSpy: MockInstance;
  let dateNowSpy: MockInstance;
  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ id: "entity-123" }),
    } as Response);
    dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(1234567890);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    dateNowSpy.mockRestore();
  });

  it("creates a note with correct payload and navigates to editor (note config)", async () => {
    render(
      <CreateEntityButton
        apiPath="/api/pages"
        defaultTitle="Untitled Note"
        redirectPathPrefix="/admin/editor"
        buttonLabel="+ New note"
        errorMessage="Failed to create note"
      />
    );

    fireEvent.click(screen.getByText(/\+ new note/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Note",
          slug: `${slugify("Untitled Note")}-1234567890`,
        }),
      });
      expect(pushMock).toHaveBeenCalledWith("/admin/editor/entity-123");
    });
  });

  it("creates a project with correct payload and navigates to project page (project config)", async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ id: "project-123" }),
    } as Response);

    render(
      <CreateEntityButton
        apiPath="/api/projects"
        defaultTitle="Untitled Project"
        redirectPathPrefix="/admin/projects"
        buttonLabel="+ New project"
        errorMessage="Failed to create project"
      />
    );

    fireEvent.click(screen.getByText(/\+ new project/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Untitled Project",
          slug: `${slugify("Untitled Project")}-1234567890`,
        }),
      });
      expect(pushMock).toHaveBeenCalledWith("/admin/projects/project-123");
    });
  });

  it("does not navigate when request fails", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    render(
      <CreateEntityButton
        apiPath="/api/pages"
        defaultTitle="Untitled Note"
        redirectPathPrefix="/admin/editor"
        buttonLabel="+ New note"
        errorMessage="Failed to create note"
      />
    );

    fireEvent.click(screen.getByText(/\+ new note/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    expect(pushMock).not.toHaveBeenCalled();
  });
});
