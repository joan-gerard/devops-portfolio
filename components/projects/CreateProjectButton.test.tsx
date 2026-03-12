import { slugify } from "@/lib/slugify";
import { fireEvent, render, screen, waitFor } from "@/test/test-utils";
import { vi, type MockInstance } from "vitest";
import { CreateProjectButton } from "./CreateProjectButton";

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
  let fetchSpy: MockInstance;
  let dateNowSpy: MockInstance;
  beforeEach(() => {
    vi.clearAllMocks();
    fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ id: "project-123" }),
    } as Response);
    dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(1234567890);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
    dateNowSpy.mockRestore();
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
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      json: async () => ({}),
    } as Response);

    render(<CreateProjectButton />);

    fireEvent.click(screen.getByText(/\+ new project/i));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
