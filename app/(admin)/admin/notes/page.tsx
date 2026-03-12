import { CreateNoteButton, NotesList } from "@/components/notes";
import { getAllPages } from "@/lib/queries/page";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function NotesPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");

  const notes = await getAllPages();
  const userNotes = notes.filter((note) => !note.e2e_only);
  const e2eNotes = notes.filter((note) => note.e2e_only);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <CreateNoteButton />
      </div>

      <section aria-label="Your notes">
        <NotesList notes={userNotes} />
      </section>

      {e2eNotes.length > 0 && (
        <section aria-label="E2E test notes">
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              marginBottom: "8px",
            }}
          >
            E2E test notes (created by automated tests)
          </div>
          <NotesList notes={e2eNotes} />
        </section>
      )}
    </div>
  );
}
