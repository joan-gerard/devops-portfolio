"use client";

import { ConfirmDeleteButton } from "@/components/shared/ConfirmDeleteButton";

export function DeleteProjectButton({ id, redirectTo }: { id: string; redirectTo?: string }) {
  return (
    <ConfirmDeleteButton
      deleteUrl={`/api/projects/${id}`}
      redirectTo={redirectTo}
      itemLabel="project"
    />
  );
}
