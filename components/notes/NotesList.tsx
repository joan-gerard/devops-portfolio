import { ADMIN_TABLE_COLUMN_TEMPLATE } from "@/components/admin/tableColumns";
import { NoteRowLink } from "@/components/notes";
import type { Page } from "@/types/pages";

type NotesListProps = {
  notes: Page[];
};

const RESERVED_ABOUT_SLUG = "about";

export function NotesList({ notes }: NotesListProps) {
  const aboutNote = notes.find((n) => n.slug === RESERVED_ABOUT_SLUG);
  const otherNotes = notes.filter((n) => n.slug !== RESERVED_ABOUT_SLUG);
  const publishedCount = notes.filter((n) => n.published).length;
  const unpublishedCount = notes.length - publishedCount;

  return (
    <div>
      {/* Reserved About note (shown above page header) */}
      {aboutNote && (
        <div style={{ marginBottom: "16px" }}>
          <div
            style={{
              padding: "0 0 8px",
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            Reserved: About page
          </div>
          <div
            style={{
              border: "1px solid var(--border)",
              borderRadius: "6px",
              overflow: "hidden",
            }}
          >
            <NoteRowLink note={aboutNote} isLast />
          </div>
        </div>
      )}

      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {unpublishedCount} unpublished
          </span>
          <span style={{ fontSize: "12px", color: "var(--accent)" }}>
            {publishedCount} published
          </span>
        </div>
      </div>

      {/* Empty state (no notes other than optional reserved about) */}
      {otherNotes.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            border: "1px dashed var(--border)",
            borderRadius: "6px",
          }}
        >
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
            {aboutNote ? "No other notes yet" : "No notes yet"}
          </p>
        </div>
      )}

      {/* Notes list (excluding reserved about, which is shown above) */}
      {otherNotes.length > 0 && (
        <div
          style={{
            border: "1px solid var(--border)",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          {/* Table header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: ADMIN_TABLE_COLUMN_TEMPLATE,
              gap: "16px",
              padding: "10px 16px",
              background: "var(--surface)",
              borderBottom: "1px solid var(--border)",
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
            }}
          >
            <span style={{ textAlign: "left" }}>Publish</span>
            <span>Title</span>
            <span style={{ textAlign: "left" }}>Tags</span>
            <span style={{ textAlign: "left" }}>Roadmap</span>
            <span style={{ textAlign: "left" }}>Updated</span>
            <span aria-hidden />
          </div>

          {/* Rows */}
          {otherNotes.map((note, i) => (
            <NoteRowLink key={note.id} note={note} isLast={i === otherNotes.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}
