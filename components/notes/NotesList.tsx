import { CreateNoteButton, NoteRowLink } from "@/components/notes";
import type { PageRow } from "@/lib/queries/page";

type NotesListProps = {
  notes: PageRow[];
};

export function NotesList({ notes }: NotesListProps) {
  return (
    <div>
      {/* Page header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div>
          <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </p>
        </div>
        <CreateNoteButton />
      </div>

      {/* Empty state */}
      {notes.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "64px 24px",
            border: "1px dashed var(--border)",
            borderRadius: "6px",
          }}
        >
          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
            No notes yet
          </p>
          <CreateNoteButton />
        </div>
      )}

      {/* Notes list */}
      {notes.length > 0 && (
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
              gridTemplateColumns: "1fr auto auto auto",
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
            <span>Title</span>
            <span>Tags</span>
            <span>Status</span>
            <span>Updated</span>
            <span></span>
          </div>

          {/* Rows */}
          {notes.map((note, i) => (
            <NoteRowLink key={note.id} note={note} isLast={i === notes.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}
