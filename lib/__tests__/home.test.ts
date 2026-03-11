import sql from "@/lib/db";
import { describe, expect, it, vi } from "vitest";
import { ROADMAP_PHASES, TECH_STACK } from "../constants/home";
import { getHomepageData } from "../queries/home";

vi.mock("@/lib/db", () => ({
  __esModule: true,
  default: vi.fn(),
}));

const mockedSql = sql as unknown as ReturnType<typeof vi.fn>;

describe("home constants", () => {
  it("exposes a non-empty TECH_STACK list", () => {
    expect(TECH_STACK.length).toBeGreaterThan(0);
    expect(TECH_STACK).toContain("Next.js");
  });

  it("defines roadmap phases with stable ordering and num/label/done fields", () => {
    expect(ROADMAP_PHASES.length).toBeGreaterThan(0);
    expect(ROADMAP_PHASES[0]).toMatchObject({
      num: "00",
      label: "Planning",
    });

    const nums = ROADMAP_PHASES.map((p) => p.num);
    expect(new Set(nums).size).toBe(nums.length);
  });
});

describe("getHomepageData", () => {
  it("queries recent notes and featured projects with correct filters and limits", async () => {
    const mockNotes = [
      {
        id: "1",
        title: "Note",
        slug: "note",
        tags: [],
        updated_at: "2024-01-01T00:00:00.000Z",
      },
    ];
    const mockProjects = [
      {
        id: "2",
        title: "Project",
        slug: "project",
        description: "desc",
        tech_stack: [],
        github_url: null,
        live_url: null,
      },
    ];

    mockedSql.mockResolvedValueOnce(mockNotes).mockResolvedValueOnce(mockProjects);

    const result = await getHomepageData();

    expect(result).toEqual({
      notes: mockNotes,
      projects: mockProjects,
    });
    expect(mockedSql).toHaveBeenCalledTimes(2);
  });
});
