"use client";
import { Page } from "@/types/pages";
import type { Extensions } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

import Link from "next/link";
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

export type NoteDetailProps = {
  note: Page;
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
  });

  const output = useMemo(() => {
    const content = note.content;
    if (!content || Object.keys(content).length === 0) return "";
    return generateHTML(
      content as Parameters<typeof generateHTML>[0],
      [StarterKit, Image, CodeBlockLowlight] as Extensions
    );
  }, [note.content]);

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 80px" }}>
      <NoteBackLink />
      <NoteDetailHeader title={note.title} tags={note.tags} updatedAt={updatedAt} />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 40px" }} />
      <NoteDetailContent content={note.content} html={output} />
    </div>
  );
}

function NoteBackLink() {
  return (
    <Link href="/notes" className="notes-back-link">
      ← All notes
    </Link>
  );
}

type NoteDetailHeaderProps = {
  title: string;
  tags: string[];
  updatedAt: string;
};

function NoteDetailHeader({ title, tags, updatedAt }: NoteDetailHeaderProps) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          marginBottom: "12px",
        }}
      >
        Note
      </p>
      <h1
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "32px",
          fontWeight: "800",
          color: "var(--text)",
          marginBottom: "12px",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        {tags.map((t) => (
          <span key={t} style={tagStyle}>
            {t}
          </span>
        ))}
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--text-muted)",
            marginLeft: tags.length > 0 ? "4px" : "0",
          }}
        >
          {updatedAt}
        </span>
      </div>
    </div>
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
    return <div className="note-content" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <p style={emptyContentStyle}>No content yet.</p>;
}
