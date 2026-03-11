import { vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/test/test-utils";
import { CreateProjectButton } from "./CreateProjectButton";
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

describe("CreateProjectButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ id: "project-123" }),
    } as Response);
    vi.spyOn(Date, "now").mockReturnValue(1234567890);
  });

  afterEach(() => {
    (global.fetch as unknown as any).mockRestore();
    (Date.now as unknown as any).mockRestore();
  });

  it("creates a project with correct payload and navigates to project page", async () => {
    render(<CreateProjectButton />);

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
    (global.fetch as unknown as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    render(<CreateProjectButton />);

    fireEvent.click(screen.getByText(/\+ new project/i));

    await waitFor(() => {
      expect(pushMock).not.toHaveBeenCalled();
    });
  });
});
