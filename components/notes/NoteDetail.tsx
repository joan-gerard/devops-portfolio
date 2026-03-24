"use client";
import { PublicNote } from "@/types/pages";
import { generateHTML } from "@tiptap/html";
import createDOMPurify from "dompurify";
import hljs from "highlight.js/lib/common";

import { DetailPageHeader } from "@/components/public/DetailPageHeader";
import { PageContainer } from "@/components/public/PageContainer";
import { BackLink } from "@/components/shared/BackLink";
import { getSharedExtensions } from "@/lib/tipTapExtensions";
import { useMemo, useSyncExternalStore } from "react";

export type NoteDetailProps = {
  note: PublicNote;
};

/**
 * Presentational component for a single note's full detail view.
 * Used by the note slug page after data is fetched.
 */
export function NoteDetail({ note }: NoteDetailProps) {
  const updatedAt = new Date(note.updated_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  const output = useMemo(() => {
    const content = note.content;
    if (!content || Object.keys(content).length === 0) return "";
    return generateHTML(content as Parameters<typeof generateHTML>[0], getSharedExtensions());
  }, [note.content]);

  return (
    <PageContainer>
      <BackLink href="/notes">← All notes</BackLink>
      <DetailPageHeader label="Note" title={note.title} tags={note.tags} updatedAt={updatedAt} />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 40px" }} />
      <NoteDetailContent content={note.content} html={output} />
    </PageContainer>
  );
}

type NoteDetailContentProps = {
  content: Record<string, unknown> | undefined;
  html: string;
};

const emptyContentStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: "var(--text-muted)",
  fontStyle: "italic",
};

const subscribeNever = () => () => {};

function useIsHydrated() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
}

function NoteDetailContent({ content, html }: NoteDetailContentProps) {
  const hasContent = content && Object.keys(content).length > 0;
  const isHydrated = useIsHydrated();
  const safeHtml = useMemo(() => {
    if (!hasContent || !html || !isHydrated) return "";
    const sanitized = createDOMPurify(window).sanitize(html);
    const document = new DOMParser().parseFromString(sanitized, "text/html");
    const codeBlocks = document.querySelectorAll("pre code");

    codeBlocks.forEach((block) => {
      const classNames = block.className.split(/\s+/).filter(Boolean);
      const languageClass = classNames.find((name) => name.startsWith("language-"));
      const language = languageClass?.replace("language-", "");
      const sourceCode = block.textContent ?? "";

      try {
        const highlighted =
          language && hljs.getLanguage(language)
            ? hljs.highlight(sourceCode, { language, ignoreIllegals: true }).value
            : hljs.highlightAuto(sourceCode).value;
        block.innerHTML = highlighted;
        block.classList.add("hljs");
      } catch {
        // Keep original text content as fallback if highlight parsing fails.
      }
    });

    return document.body.innerHTML;
  }, [hasContent, html, isHydrated]);

  if (hasContent && safeHtml) {
    return <div className="note-content" dangerouslySetInnerHTML={{ __html: safeHtml }} />;
  }
  if (hasContent) {
    // Keep server and initial client render identical; hydrate content after mount.
    return <div className="note-content" aria-live="polite" />;
  }
  return <p style={emptyContentStyle}>No content yet.</p>;
}
