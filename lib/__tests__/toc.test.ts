import {
  createHeadingBaseId,
  createUniqueHeadingId,
  extractTocItemsFromTipTapContent,
} from "@/lib/toc";

describe("toc helpers", () => {
  it("creates stable heading base IDs", () => {
    expect(createHeadingBaseId("  CI/CD & Pipelines  ")).toBe("cicd-pipelines");
    expect(createHeadingBaseId("___")).toBe("section");
    expect(createHeadingBaseId("")).toBe("section");
  });

  it("creates unique IDs for duplicate headings", () => {
    const seenIds = new Map<string, number>();
    expect(createUniqueHeadingId("Intro", seenIds)).toBe("intro");
    expect(createUniqueHeadingId("Intro", seenIds)).toBe("intro-2");
    expect(createUniqueHeadingId("Intro", seenIds)).toBe("intro-3");
  });

  it("extracts TOC items from TipTap JSON in document order", () => {
    const doc = {
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Overview" }],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "body" }],
        },
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Install" }],
        },
        {
          type: "heading",
          attrs: { level: 4 },
          content: [{ type: "text", text: "Notes" }],
        },
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Overview" }],
        },
      ],
    };

    expect(extractTocItemsFromTipTapContent(doc)).toEqual([
      { id: "overview", text: "Overview", level: 2 },
      { id: "install", text: "Install", level: 3 },
      { id: "notes", text: "Notes", level: 4 },
      { id: "overview-2", text: "Overview", level: 2 },
    ]);
  });
});
