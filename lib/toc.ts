import { slugify } from "@/lib/slugify";

type TipTapContentNode = {
  type?: string;
  attrs?: {
    level?: number;
  };
  text?: string;
  content?: TipTapContentNode[];
};

export type TocItem = {
  id: string;
  text: string;
  level: number;
};

/** Heading levels included in table-of-contents (matches public HTML + editor). */
export const DEFAULT_TOC_HEADING_LEVELS: readonly number[] = [2, 3, 4];

const DEFAULT_HEADING_ID = "section";

export function createHeadingBaseId(text: string): string {
  const value = slugify(text).replace(/_/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return value || DEFAULT_HEADING_ID;
}

export function ensureUniqueHeadingId(baseId: string, seenIds: Map<string, number>): string {
  const normalizedBaseId = baseId || DEFAULT_HEADING_ID;
  const seenCount = seenIds.get(normalizedBaseId) ?? 0;
  const nextCount = seenCount + 1;
  seenIds.set(normalizedBaseId, nextCount);
  return seenCount === 0 ? normalizedBaseId : `${normalizedBaseId}-${nextCount}`;
}

export function createUniqueHeadingId(text: string, seenIds: Map<string, number>): string {
  return ensureUniqueHeadingId(createHeadingBaseId(text), seenIds);
}

function collectNodeText(node: TipTapContentNode | undefined): string {
  if (!node) return "";
  const ownText = typeof node.text === "string" ? node.text : "";
  const childText = (node.content ?? []).map((child) => collectNodeText(child)).join("");
  return `${ownText}${childText}`;
}

function walkForHeadings(
  node: TipTapContentNode,
  seenIds: Map<string, number>,
  includeLevels: Set<number>,
  output: TocItem[]
) {
  if (node.type === "heading") {
    const level = typeof node.attrs?.level === "number" ? node.attrs.level : 0;
    if (includeLevels.has(level)) {
      const text = collectNodeText(node).trim();
      if (text.length > 0) {
        output.push({
          id: createUniqueHeadingId(text, seenIds),
          text,
          level,
        });
      }
    }
  }

  for (const child of node.content ?? []) {
    walkForHeadings(child, seenIds, includeLevels, output);
  }
}

export function extractTocItemsFromTipTapContent(
  content: unknown,
  levels: number[] = [...DEFAULT_TOC_HEADING_LEVELS]
): TocItem[] {
  if (!content || typeof content !== "object") return [];
  const root = content as TipTapContentNode;
  const seenIds = new Map<string, number>();
  const includeLevels = new Set(levels);
  const output: TocItem[] = [];
  walkForHeadings(root, seenIds, includeLevels, output);
  return output;
}
