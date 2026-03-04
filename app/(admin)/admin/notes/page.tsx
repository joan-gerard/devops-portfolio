import { NotesList } from "@/components/notes";
import { getAllPages } from "@/lib/queries/page";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function NotesPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");

  const notes = await getAllPages();

  return <NotesList notes={notes} />;
}
