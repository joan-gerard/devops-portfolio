import { vi, type MockInstance } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import { CreateNoteButton } from "./CreateNoteButton";
import { slugify } from "@/lib/slugify";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/lib/slugify", () => ({
  slugify: vi.fn((value: string) => value.toLowerCase().replace(/\s+/g, "-")),
}));

describe("CreateNoteButton", () => {
  let fetchSpy: MockInstance;
  let dateNowSpy: MockInstance;
  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ id: "note-123" }),
    } as Response);
    dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(1234567890);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    dateNowSpy.mockRestore();
  });

  it("creates a note with correct payload and navigates to editor", async () => {
    render(<CreateNoteButton />);

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
      expect(pushMock).toHaveBeenCalledWith("/admin/editor/note-123");
    });
  });

  it("does not navigate when request fails", async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    render(<CreateNoteButton />);

    fireEvent.click(screen.getByText(/\+ new note/i));

    await waitFor(() => {
      expect(pushMock).not.toHaveBeenCalled();
    });
  });
});
