"use client";

import { CreateEntityButton } from "@/components/shared/CreateEntityButton";

export function CreateNoteButton() {
  return (
    <CreateEntityButton
      apiPath="/api/pages"
      defaultTitle="Untitled Note"
      redirectPathPrefix="/admin/editor"
      buttonLabel="+ New note"
      errorMessage="Failed to create note"
    />
  );
}
