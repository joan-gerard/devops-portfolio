"use client";

import Link from "next/link";
import type { RecentNote } from "@/types/home";
import { card, tag } from "./sectionStyles";

type NoteCardProps = { note: RecentNote };

export function NoteCard({ note }: NoteCardProps) {
  return (
    <Link href={`/notes/${note.slug}`} style={{ textDecoration: "none" }}>
      <div
        style={{
          ...card,
          height: "100%",
          transition: "border-color 0.15s",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent)")}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
      >
        <p
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "15px",
            fontWeight: "700",
            color: "var(--text)",
            marginBottom: "12px",
            lineHeight: 1.3,
          }}
        >
          {note.title}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
          {note.tags.slice(0, 3).map((t) => (
            <span key={t} style={tag}>
              {t}
            </span>
          ))}
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--text-muted)",
          }}
        >
          {new Date(note.updated_at).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      </div>
    </Link>
  );
}
