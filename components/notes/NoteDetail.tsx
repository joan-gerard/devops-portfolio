"use client";
import { PublicNote, PublishedNotePreview } from "@/types/pages";
import { generateHTML } from "@tiptap/html";
import Link from "next/link";

import { DetailPageHeader } from "@/components/public/DetailPageHeader";
import { PageContainer } from "@/components/public/PageContainer";
import { BackLink } from "@/components/shared/BackLink";
import { BackToTopButton } from "@/components/shared/BackToTopButton";
import { renderRichContentHtmlWithToc } from "@/lib/renderRichContentHtml";
import { getSharedExtensions } from "@/lib/tipTapExtensions";
import type { TocItem } from "@/lib/toc";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";

export type NoteDetailProps = {
  note: PublicNote;
  relatedNotes?: PublishedNotePreview[];
  backHref?: string;
  backLabel?: string;
};

/**
 * Presentational component for a single note's full detail view.
 * Used by the note slug page after data is fetched.
 */
export function NoteDetail({
  note,
  relatedNotes = [],
  backHref = "/notes",
  backLabel = "← All notes",
}: NoteDetailProps) {
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

  const hasContent = Boolean(note.content && Object.keys(note.content).length > 0);
  const rendered = useMemo(() => {
    if (!hasContent || !output) return { html: "", toc: [] as TocItem[] };
    if (typeof window === "undefined") {
      return { html: output, toc: [] };
    }
    return renderRichContentHtmlWithToc(output);
  }, [hasContent, output]);

  const showRightRail = rendered.toc.length > 0 || relatedNotes.length > 0;

  return (
    <PageContainer>
      <BackLink href={backHref}>{backLabel}</BackLink>
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
          <NoteDetailContent hasContent={hasContent} safeHtml={rendered.html} />
        </div>

        {showRightRail ? (
          <aside
            className="w-full lg:w-[320px] lg:sticky lg:top-24"
            style={{ display: "grid", gap: "28px" }}
          >
            <TableOfContentsAside toc={rendered.toc} />
            <RelatedNotesAside relatedNotes={relatedNotes} />
          </aside>
        ) : null}
      </div>
      <BackToTopButton />
    </PageContainer>
  );
}

type NoteDetailContentProps = {
  hasContent: boolean;
  safeHtml: string;
};

const emptyContentStyle: CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: "var(--text-muted)",
  fontStyle: "italic",
};

type RelatedNotesAsideProps = {
  relatedNotes: PublishedNotePreview[];
};

function RelatedNotesAside({ relatedNotes }: RelatedNotesAsideProps) {
  if (relatedNotes.length === 0) return null;

  return (
    <section aria-label="Related notes">
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
    </section>
  );
}

function NoteDetailContent({ hasContent, safeHtml }: NoteDetailContentProps) {
  if (hasContent && safeHtml) {
    return (
      <div
        className="note-content"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
    );
  }
  if (hasContent) {
    // Keep server and initial client render identical; hydrate content after mount.
    return <div className="note-content" aria-live="polite" />;
  }
  return <p style={emptyContentStyle}>No content yet.</p>;
}

type TableOfContentsAsideProps = {
  toc: TocItem[];
};

function TableOfContentsAside({ toc }: TableOfContentsAsideProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const currentActiveId = toc.length === 0 ? null : activeId;

  useEffect(() => {
    if (toc.length === 0 || typeof window === "undefined") {
      return;
    }

    const computeActiveId = () => {
      const headerOffset = 120;
      let bestId: string | null = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (const item of toc) {
        const element = document.getElementById(item.id);
        if (!element) continue;
        const distance = Math.abs(element.getBoundingClientRect().top - headerOffset);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestId = item.id;
        }
      }

      setActiveId(bestId);
    };

    const frame = window.requestAnimationFrame(computeActiveId);
    window.addEventListener("scroll", computeActiveId, { passive: true });
    window.addEventListener("resize", computeActiveId);
    window.addEventListener("hashchange", computeActiveId);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", computeActiveId);
      window.removeEventListener("resize", computeActiveId);
      window.removeEventListener("hashchange", computeActiveId);
    };
  }, [toc]);

  if (toc.length === 0) return null;
  return (
    <nav aria-label="Table of contents" className="note-toc">
      <div className="note-toc-label">On this page</div>
      <ol className="note-toc-list">
        {toc.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`note-toc-link${currentActiveId === item.id ? " note-toc-link--active" : ""}`}
              style={{ paddingLeft: `${Math.max(item.level - 1, 0) * 12}px` }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
