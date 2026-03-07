import Link from "next/link";
import type { RecentNote } from "@/types/home";
import { sectionLabel, sectionHeading, viewAllLink } from "./sectionStyles";
import { NoteCard } from "./NoteCard";

type RecentNotesSectionProps = { notes: RecentNote[] };

export function RecentNotesSection({ notes }: RecentNotesSectionProps) {
  return (
    <section style={{ marginBottom: "72px" }}>
      <p style={sectionLabel}>Recent Notes</p>
      <h2 style={sectionHeading}>What I&apos;ve been writing</h2>

      {notes.length === 0 ? (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}
        >
          No notes published yet.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "12px",
          }}
        >
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      <Link href="/notes" style={viewAllLink}>
        All notes →
      </Link>
    </section>
  );
}
