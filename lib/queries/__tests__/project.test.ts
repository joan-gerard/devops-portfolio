import sql from "@/lib/db";
import type { Project, PublicProject } from "@/types/projects";
import type { PublishedProject } from "../project";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getAllProjects,
  getAllPublishedProjects,
  getProjectById,
  getProjectBySlug,
} from "../project";

vi.mock("@/lib/db", () => ({ default: vi.fn() }));

const mockSql = vi.mocked(sql);

/** postgres sql return type includes ResultQueryMeta; we only need array-like in tests */
function asSqlResult<T>(value: T): Awaited<ReturnType<typeof sql>> {
  return value as Awaited<ReturnType<typeof sql>>;
}

describe("project queries", () => {
  beforeEach(() => {
    mockSql.mockReset();
  });

  describe("getAllProjects", () => {
    it("returns full admin project list from sql ordered by updated_at DESC", async () => {
      const projects: Project[] = [
        {
          id: "1",
          title: "Project",
          slug: "project",
          description: "Desc",
          tech_stack: [],
          github_url: null,
          live_url: null,
          published: true,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-06-01T00:00:00Z",
        },
      ];
      mockSql.mockResolvedValueOnce(asSqlResult(projects));

      const result = await getAllProjects();

      expect(result).toEqual(projects);
      expect(mockSql).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllPublishedProjects", () => {
    it("returns only published project shape (no published/created_at in type)", async () => {
      const published: PublishedProject[] = [
        {
          id: "1",
          title: "Project",
          slug: "project",
          description: "Desc",
          tech_stack: [],
          github_url: null,
          live_url: null,
        },
      ];
      mockSql.mockResolvedValueOnce(asSqlResult(published));

      const result = await getAllPublishedProjects();

      expect(result).toEqual(published);
      expect(mockSql).toHaveBeenCalledTimes(1);
    });

    it("returns empty array and logs when prerender build and connection error", async () => {
      const prev = process.env.IS_PRERENDER_BUILD;
      process.env.IS_PRERENDER_BUILD = "true";
      const err = new Error("Connection refused") as Error & { code?: string };
      err.code = "ECONNREFUSED";
      mockSql.mockRejectedValueOnce(err);
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await getAllPublishedProjects();

      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(
        "[getAllPublishedProjects] DB unavailable during prerender build — returning empty list.",
        expect.any(String)
      );
      warnSpy.mockRestore();
      process.env.IS_PRERENDER_BUILD = prev;
    });

    it("rethrows when not prerender build", async () => {
      const prev = process.env.IS_PRERENDER_BUILD;
      process.env.IS_PRERENDER_BUILD = "false";
      const err = new Error("Connection refused") as Error & { code?: string };
      err.code = "ECONNREFUSED";
      mockSql.mockRejectedValueOnce(err);

      await expect(getAllPublishedProjects()).rejects.toThrow("Connection refused");

      process.env.IS_PRERENDER_BUILD = prev;
    });
  });

  describe("getProjectById", () => {
    it("returns project when found", async () => {
      const project: Project = {
        id: "1",
        title: "Project",
        slug: "project",
        description: "Desc",
        tech_stack: [],
        github_url: null,
        live_url: null,
        published: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-06-01T00:00:00Z",
      };
      mockSql.mockResolvedValueOnce(asSqlResult([project]));

      const result = await getProjectById("1");

      expect(result).toEqual(project);
    });

    it("returns null when not found", async () => {
      mockSql.mockResolvedValueOnce(asSqlResult([]));

      const result = await getProjectById("missing");

      expect(result).toBeNull();
    });
  });

  describe("getProjectBySlug", () => {
    it("returns published project when found", async () => {
      const project: PublicProject = {
        id: "1",
        title: "Project",
        slug: "project",
        description: "Desc",
        tech_stack: [],
        github_url: null,
        live_url: null,
        updated_at: "2024-06-01T00:00:00Z",
      };
      mockSql.mockResolvedValueOnce(asSqlResult([project]));

      const result = await getProjectBySlug("project");

      expect(result).toEqual(project);
    });

    it("returns null when not found", async () => {
      mockSql.mockResolvedValueOnce(asSqlResult([]));

      const result = await getProjectBySlug("missing");

      expect(result).toBeNull();
    });
  });
});
