import { fireEvent, render, screen, waitFor } from "@/test/test-utils";
import { vi, type MockInstance } from "vitest";
import DeleteNoteButton from "./DeleteNoteButton";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

describe("DeleteNoteButton", () => {
  let fetchSpy: MockInstance;
  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it("shows confirm UI when clicked", () => {
    render(<DeleteNoteButton id="note-1" />);
    fireEvent.click(screen.getByRole("button", { name: /delete note/i }));

    expect(screen.getByRole("dialog", { name: /confirm deletion/i })).toBeInTheDocument();
    expect(screen.getByText(/delete this note/i)).toBeInTheDocument();
  });

  it("calls DELETE API and refreshes when confirmed without redirect", async () => {
    render(<DeleteNoteButton id="note-1" />);

    fireEvent.click(screen.getByRole("button", { name: /delete note/i }));
    fireEvent.click(screen.getByText(/^delete$/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/pages/note-1", { method: "DELETE" });
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("calls DELETE API and redirects when confirm clicked with redirectTo", async () => {
    render(<DeleteNoteButton id="note-2" redirectTo="/notes" />);

    fireEvent.click(screen.getByRole("button", { name: /delete note/i }));
    fireEvent.click(screen.getByText(/^delete$/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/pages/note-2", { method: "DELETE" });
      expect(pushMock).toHaveBeenCalledWith("/notes");
    });
  });

  it("cancels and restores original button", () => {
    render(<DeleteNoteButton id="note-1" />);

    fireEvent.click(screen.getByRole("button", { name: /delete note/i }));
    fireEvent.click(screen.getByText(/cancel/i));

    expect(screen.queryByRole("dialog", { name: /confirm deletion/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/cancel/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete note/i })).toBeInTheDocument();
  });
});
