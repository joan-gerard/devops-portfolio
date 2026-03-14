"use client";
import { PublicNote } from "@/types/pages";
import { generateHTML } from "@tiptap/html";
import DOMPurify from "dompurify";

import { getSharedExtensions } from "@/lib/tipTapExtensions";
import { BackLink } from "@/components/shared/BackLink";
import { DetailPageHeader } from "@/components/public/DetailPageHeader";
import { PageContainer } from "@/components/public/PageContainer";
import { useMemo } from "react";

const tagStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  color: "var(--text-muted)",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  padding: "2px 8px",
  textTransform: "lowercase",
};

const metadataDateStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "10px",
  color: "var(--text-muted)",
};

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

  const metadata = (
    <>
      {note.tags.map((t) => (
        <span key={t} style={tagStyle}>
          {t}
        </span>
      ))}
      <span style={{ ...metadataDateStyle, marginLeft: note.tags.length > 0 ? "4px" : 0 }}>
        {updatedAt}
      </span>
    </>
  );

  return (
    <PageContainer>
      <BackLink href="/notes">← All notes</BackLink>
      <DetailPageHeader label="Note" title={note.title} metadata={metadata} />
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

function NoteDetailContent({ content, html }: NoteDetailContentProps) {
  const hasContent = content && Object.keys(content).length > 0;
  if (hasContent && html) {
    const safeHtml = DOMPurify.sanitize(html);
    return <div className="note-content" dangerouslySetInnerHTML={{ __html: safeHtml }} />;
  }
  return <p style={emptyContentStyle}>No content yet.</p>;
}
