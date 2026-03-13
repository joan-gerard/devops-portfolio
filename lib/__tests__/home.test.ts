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

    // sql is called 4 times: 2 full queries (notes, projects) + 2 conditional fragments (AND e2e_only = false).
    // Resolve by query content so order of calls does not matter.
    mockedSql.mockImplementation((strings: unknown) => {
      const sqlText = Array.isArray(strings) ? (strings as string[]).join("") : String(strings);
      if (sqlText.includes("FROM pages")) return Promise.resolve(mockNotes);
      if (sqlText.includes("FROM projects")) return Promise.resolve(mockProjects);
      return Promise.resolve([]);
    });

    const result = await getHomepageData();

    expect(result).toEqual({
      notes: mockNotes,
      projects: mockProjects,
    });
    // 4 calls: 2 full queries (notes, projects) + 2 conditional fragments
    expect(mockedSql).toHaveBeenCalledTimes(4);

    // Assert the actual SQL passed to the query function (tagged template first arg)
    const getSqlFromCall = (call: unknown[]): string =>
      Array.isArray(call[0]) ? (call[0] as string[]).join("") : String(call[0]);

    const notesCall = mockedSql.mock.calls.find((c) => getSqlFromCall(c).includes("FROM pages"));
    const projectsCall = mockedSql.mock.calls.find((c) =>
      getSqlFromCall(c).includes("FROM projects")
    );
    expect(notesCall).toBeDefined();
    expect(projectsCall).toBeDefined();

    const notesSql = getSqlFromCall(notesCall!);
    expect(notesSql).toContain("WHERE published = true");
    expect(notesSql).toContain("slug != 'about'");
    expect(notesSql).toContain("LIMIT 3");

    const projectsSql = getSqlFromCall(projectsCall!);
    expect(projectsSql).toContain("WHERE published = true");
    expect(projectsSql).toContain("FROM projects");
    expect(projectsSql).toContain("LIMIT 3");
  });
});
