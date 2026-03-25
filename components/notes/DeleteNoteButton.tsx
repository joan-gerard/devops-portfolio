"use client";

import { ConfirmDeleteButton } from "@/components/shared/ConfirmDeleteButton";

export default function DeleteNoteButton({ id, redirectTo }: { id: string; redirectTo?: string }) {
  return (
    <ConfirmDeleteButton deleteUrl={`/api/pages/${id}`} redirectTo={redirectTo} itemLabel="note" />
  );
}
