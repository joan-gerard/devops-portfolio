import sql from "@/lib/db";
import type { Page, PublicNote, PublishedNotePreview } from "@/types/pages";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAllPages, getAllPublishedNotes, getNoteBySlug, getPageById } from "../page";

vi.mock("@/lib/db", () => ({ default: vi.fn() }));

const mockSql = vi.mocked(sql);

/** postgres sql return type includes ResultQueryMeta; we only need array-like in tests */
function asSqlResult<T>(value: T): Awaited<ReturnType<typeof sql>> {
  return value as Awaited<ReturnType<typeof sql>>;
}

describe("page queries", () => {
  beforeEach(() => {
    mockSql.mockReset();
  });

  describe("getAllPages", () => {
    it("returns pages from sql ordered by created_at ASC", async () => {
      const pages: Page[] = [
        {
          id: "2",
          title: "Older",
          slug: "older",
          tags: [],
          published: true,
          updated_at: "2024-01-01T00:00:00Z",
        },
        {
          id: "1",
          title: "Newer",
          slug: "newer",
          tags: [],
          published: false,
          updated_at: "2024-06-01T00:00:00Z",
        },
      ];
      mockSql.mockResolvedValueOnce(asSqlResult(pages));

      const result = await getAllPages();

      expect(result).toEqual(pages);
      expect(mockSql).toHaveBeenCalledTimes(1);
    });
  });

  describe("getPageById", () => {
    it("returns the first row when found", async () => {
      const page: Page = {
        id: "1",
        title: "Note",
        slug: "note",
        content: {},
        tags: ["a"],
        published: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-06-01T00:00:00Z",
      };
      mockSql.mockResolvedValueOnce(asSqlResult([page]));

      const result = await getPageById("1");

      expect(result).toEqual(page);
    });

    it("returns null when no row", async () => {
      mockSql.mockResolvedValueOnce(asSqlResult([]));

      const result = await getPageById("missing");

      expect(result).toBeNull();
    });
  });

  describe("getNoteBySlug", () => {
    type MockSqlFragment = { __mockSqlFragment: true; text: string };

    const isMockSqlFragment = (value: unknown): value is MockSqlFragment =>
      typeof value === "object" &&
      value !== null &&
      "__mockSqlFragment" in value &&
      "text" in value &&
      (value as { __mockSqlFragment?: unknown }).__mockSqlFragment === true;

    const composeSqlText = (strings: readonly string[], values: readonly unknown[]): string => {
      let text = "";
      for (let i = 0; i < strings.length; i += 1) {
        text += strings[i] ?? "";
        if (i < values.length) {
          const value = values[i];
          text += isMockSqlFragment(value) ? value.text : String(value);
        }
      }
      return text;
    };

    const getSqlFromCall = (call: unknown[]): string => {
      const [strings, ...values] = call;
      if (Array.isArray(strings)) {
        return composeSqlText(strings as string[], values);
      }
      return String(strings);
    };

    const getOuterPagesQuerySql = (): string | undefined => {
      const outerCall = mockSql.mock.calls.find((c) => getSqlFromCall(c).includes("FROM pages"));
      return outerCall ? getSqlFromCall(outerCall) : undefined;
    };

    const mockNoteQueryResult = (result: PublicNote | null) => {
      mockSql.mockImplementation(((strings: unknown, ...values: unknown[]) => {
        const sqlText = Array.isArray(strings)
          ? composeSqlText(strings as string[], values)
          : String(strings);
        if (sqlText.includes("FROM pages")) {
          return Promise.resolve(asSqlResult(result ? [result] : [])) as ReturnType<typeof sql>;
        }
        return {
          __mockSqlFragment: true,
          text: sqlText,
        } as unknown as ReturnType<typeof sql>;
      }) as typeof sql);
    };

    it("returns published note when found", async () => {
      const note: PublicNote = {
        id: "1",
        title: "About",
        slug: "about",
        content: {},
        tags: [],
        updated_at: "2024-06-01T00:00:00Z",
      };
      mockNoteQueryResult(note);

      const result = await getNoteBySlug("about");

      expect(result).toEqual(note);
    });

    it("uses published filter by default", async () => {
      const note: PublicNote = {
        id: "published-note",
        title: "Published",
        slug: "published-note",
        content: {},
        tags: [],
        updated_at: "2024-06-01T00:00:00Z",
      };
      mockNoteQueryResult(note);

      await getNoteBySlug("published-note");

      const outerQuerySql = getOuterPagesQuerySql();
      expect(outerQuerySql).toBeDefined();
      expect(outerQuerySql).toContain("AND published = true");
    });

    it("omits published filter when includeUnpublished is true", async () => {
      const draftNote: PublicNote = {
        id: "draft-note",
        title: "Draft",
        slug: "draft-note",
        content: {},
        tags: [],
        updated_at: "2024-06-01T00:00:00Z",
      };
      mockNoteQueryResult(draftNote);

      const result = await getNoteBySlug("draft-note", { includeUnpublished: true });

      expect(result).toEqual(draftNote);
      const outerQuerySql = getOuterPagesQuerySql();
      expect(outerQuerySql).toBeDefined();
      expect(outerQuerySql).not.toContain("AND published = true");
    });

    it("returns null when no row", async () => {
      mockNoteQueryResult(null);

      const result = await getNoteBySlug("missing");

      expect(result).toBeNull();
    });

    it("returns null and logs when prerender build and connection error", async () => {
      const prev = process.env.IS_PRERENDER_BUILD;
      process.env.IS_PRERENDER_BUILD = "true";
      const err = new Error("Connection refused") as Error & { code?: string };
      err.code = "ECONNREFUSED";
      mockSql.mockImplementation(((strings: unknown) => {
        const sqlText = Array.isArray(strings) ? (strings as string[]).join("") : String(strings);
        if (sqlText.includes("FROM pages")) {
          return Promise.reject(err);
        }
        return Promise.resolve(asSqlResult([]));
      }) as unknown as typeof sql);
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await getNoteBySlug("about");

      expect(result).toBeNull();
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[getNoteBySlug] DB unavailable during prerender build — returning null. Slug: about. Reason:"
        )
      );
      warnSpy.mockRestore();
      process.env.IS_PRERENDER_BUILD = prev;
    });

    it("rethrows when not prerender build", async () => {
      const prev = process.env.IS_PRERENDER_BUILD;
      process.env.IS_PRERENDER_BUILD = "false";
      const err = new Error("Connection refused") as Error & { code?: string };
      err.code = "ECONNREFUSED";
      mockSql.mockImplementation(((strings: unknown) => {
        const sqlText = Array.isArray(strings) ? (strings as string[]).join("") : String(strings);
        if (sqlText.includes("FROM pages")) {
          return Promise.reject(err);
        }
        return Promise.resolve(asSqlResult([]));
      }) as unknown as typeof sql);

      await expect(getNoteBySlug("about")).rejects.toThrow("Connection refused");

      process.env.IS_PRERENDER_BUILD = prev;
    });
  });

  describe("getAllPublishedNotes", () => {
    it("returns published note previews (excluding about is enforced in SQL)", async () => {
      const notes: PublishedNotePreview[] = [
        {
          id: "1",
          title: "Note",
          slug: "note",
          tags: [],
          updated_at: "2024-06-01T00:00:00Z",
        },
      ];
      mockSql.mockResolvedValueOnce(asSqlResult([])).mockResolvedValueOnce(asSqlResult(notes));

      const result = await getAllPublishedNotes();

      expect(result).toEqual(notes);
      expect(mockSql).toHaveBeenCalledTimes(2);
    });

    it("returns empty array and logs when prerender build and connection error", async () => {
      const prev = process.env.IS_PRERENDER_BUILD;
      process.env.IS_PRERENDER_BUILD = "true";
      const err = new Error("Connection refused") as Error & { code?: string };
      err.code = "ECONNREFUSED";
      mockSql.mockResolvedValueOnce(asSqlResult([])).mockRejectedValueOnce(err);
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const result = await getAllPublishedNotes();

      expect(result).toEqual([]);
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          "[getAllPublishedNotes] DB unavailable during prerender build — returning empty list. Reason:"
        )
      );
      warnSpy.mockRestore();
      process.env.IS_PRERENDER_BUILD = prev;
    });

    it("rethrows when not prerender build", async () => {
      const prev = process.env.IS_PRERENDER_BUILD;
      process.env.IS_PRERENDER_BUILD = "false";
      const err = new Error("Connection refused") as Error & { code?: string };
      err.code = "ECONNREFUSED";
      mockSql.mockResolvedValueOnce(asSqlResult([])).mockRejectedValueOnce(err);

      await expect(getAllPublishedNotes()).rejects.toThrow("Connection refused");

      process.env.IS_PRERENDER_BUILD = prev;
    });
  });
});
