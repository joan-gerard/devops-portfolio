import { vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
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
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response);
  });

  afterEach(() => {
    (global.fetch as unknown as any).mockRestore();
  });

  it("shows confirm UI when clicked", () => {
    render(<DeleteNoteButton id="note-1" />);
    fireEvent.click(screen.getByText(/delete/i));

    expect(screen.getByText(/sure\?/i)).toBeInTheDocument();
  });

  it("calls DELETE API and refreshes when confirmed without redirect", async () => {
    render(<DeleteNoteButton id="note-1" />);

    fireEvent.click(screen.getByText(/delete/i));
    fireEvent.click(screen.getByText(/^delete$/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/pages/note-1", { method: "DELETE" });
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("calls DELETE API and redirects when confirm clicked with redirectTo", async () => {
    render(<DeleteNoteButton id="note-2" redirectTo="/notes" />);

    fireEvent.click(screen.getByText(/delete/i));
    fireEvent.click(screen.getByText(/^delete$/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/pages/note-2", { method: "DELETE" });
      expect(pushMock).toHaveBeenCalledWith("/notes");
    });
  });

  it("cancels and restores original button", () => {
    render(<DeleteNoteButton id="note-1" />);

    fireEvent.click(screen.getByText(/delete/i));
    fireEvent.click(screen.getByText(/cancel/i));

    expect(screen.getByText(/delete/i)).toBeInTheDocument();
  });
});
