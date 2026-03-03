import EditorPageClient from "@/components/editor/EditorPageClient";
import { getPageById } from "@/lib/queries/page";
import { Page } from "@/types/pages";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;

  const note = await getPageById(id);
  if (!note) notFound();

  return <EditorPageClient note={note as Page} />;
}
