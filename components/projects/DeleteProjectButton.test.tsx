import { vi, type MockInstance } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import { DeleteProjectButton } from "./DeleteProjectButton";

const pushMock = vi.fn();
const refreshMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

describe("DeleteProjectButton", () => {
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
    render(<DeleteProjectButton id="project-1" />);

    fireEvent.click(screen.getByRole("button", { name: /delete project/i }));

    expect(screen.getByRole("dialog", { name: /confirm deletion/i })).toBeInTheDocument();
    expect(screen.getByText(/delete this project/i)).toBeInTheDocument();
  });

  it("calls DELETE API and refreshes when confirmed without redirect", async () => {
    render(<DeleteProjectButton id="project-1" />);

    fireEvent.click(screen.getByRole("button", { name: /delete project/i }));
    fireEvent.click(screen.getByText(/^delete$/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/projects/project-1", { method: "DELETE" });
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("calls DELETE API and redirects when confirm clicked with redirectTo", async () => {
    render(<DeleteProjectButton id="project-2" redirectTo="/projects" />);

    fireEvent.click(screen.getByRole("button", { name: /delete project/i }));
    fireEvent.click(screen.getByText(/^delete$/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/projects/project-2", { method: "DELETE" });
      expect(pushMock).toHaveBeenCalledWith("/projects");
    });
  });

  it("cancels and restores original button", () => {
    render(<DeleteProjectButton id="project-1" />);

    fireEvent.click(screen.getByRole("button", { name: /delete project/i }));
    fireEvent.click(screen.getByText(/cancel/i));

    expect(screen.queryByRole("dialog", { name: /confirm deletion/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /delete project/i })).toBeInTheDocument();
  });
});
