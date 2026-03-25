"use client";
import { PublicNote, PublishedNotePreview } from "@/types/pages";
import { generateHTML } from "@tiptap/html";
import createDOMPurify from "dompurify";
import hljs from "highlight.js/lib/common";
import Link from "next/link";

import { DetailPageHeader } from "@/components/public/DetailPageHeader";
import { PageContainer } from "@/components/public/PageContainer";
import { BackLink } from "@/components/shared/BackLink";
import { getSharedExtensions } from "@/lib/tipTapExtensions";
import type { CSSProperties } from "react";
import { useMemo, useSyncExternalStore } from "react";

export type NoteDetailProps = {
  note: PublicNote;
  relatedNotes?: PublishedNotePreview[];
};

/**
 * Presentational component for a single note's full detail view.
 * Used by the note slug page after data is fetched.
 */
export function NoteDetail({ note, relatedNotes = [] }: NoteDetailProps) {
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
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
        <div className="flex-1 min-w-0">
          <DetailPageHeader
            label="Note"
            title={note.title}
            tags={note.tags}
            updatedAt={updatedAt}
          />
          <hr
            style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 40px" }}
          />
          <NoteDetailContent content={note.content} html={output} />
        </div>

        <RelatedNotesAside note={note} relatedNotes={relatedNotes} />
      </div>
    </PageContainer>
  );
}

type NoteDetailContentProps = {
  content: Record<string, unknown> | undefined;
  html: string;
};

const emptyContentStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: "var(--text-muted)",
  fontStyle: "italic",
};

type RelatedNotesAsideProps = {
  note: PublicNote;
  relatedNotes: PublishedNotePreview[];
};

function RelatedNotesAside({ note, relatedNotes }: RelatedNotesAsideProps) {
  if (relatedNotes.length === 0) return null;

  return (
    <aside aria-label="Related notes" className="w-full lg:w-[320px] lg:sticky lg:top-24">
      <div
        style={{
          borderRadius: "6px",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: "14px",
          }}
        >
          Related notes
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {relatedNotes.map((r) => {
            return (
              <Link key={r.id} href={`/notes/${r.slug}`} style={{ textDecoration: "none" }}>
                <div
                  className="u-border-accent-hover u-bg-surface-hover"
                  style={{
                    border: "0.5px solid var(--border)",
                    borderRadius: "6px",
                    padding: "12px 12px",
                    background: "transparent",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "var(--font-heading)",
                      fontSize: "14px",
                      fontWeight: 700,
                      color: "var(--text)",
                      marginBottom: "6px",
                      lineHeight: 1.2,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {r.title}
                  </p>

                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--text-muted)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {new Date(r.updated_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

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
