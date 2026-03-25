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

function getCodeLanguageLabel(language: string | undefined): string | null {
  if (!language) return null;
  switch (language) {
    case "plaintext":
      return null;
    case "typescript":
      return "TS/TSX";
    case "javascript":
      return "JS/JSX";
    case "bash":
      return "Bash";
    case "dockerfile":
      return "Dockerfile";
    case "json":
      return "JSON";
    case "python":
      return "Python";
    case "sql":
      return "SQL";
    default:
      return language.toUpperCase();
  }
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
      const languageLabel = getCodeLanguageLabel(language);
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

      // Add a small badge in the top-right corner for the code block language.
      if (languageLabel) {
        const preEl = block.closest("pre");
        if (preEl && !preEl.querySelector(".code-lang-badge")) {
          const badge = document.createElement("div");
          badge.className = "code-lang-badge";
          badge.textContent = languageLabel;
          badge.style.position = "absolute";
          badge.style.top = "8px";
          badge.style.right = "12px";
          badge.style.zIndex = "2";
          badge.style.background = "var(--surface-2)";
          badge.style.border = "1px solid var(--border)";
          badge.style.color = "var(--text-muted)";
          badge.style.borderRadius = "4px";
          badge.style.padding = "1px 6px";
          badge.style.fontSize = "10px";
          badge.style.textTransform = "uppercase";
          badge.style.letterSpacing = "0.06em";
          badge.style.pointerEvents = "none";

          // Insert as first child so it never ends up in normal flow.
          preEl.insertBefore(badge, preEl.firstChild);
        }
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
