"use client";

import { CreateEntityButton } from "@/components/shared/CreateEntityButton";

export function CreateProjectButton() {
  return (
    <CreateEntityButton
      apiPath="/api/projects"
      defaultTitle="Untitled Project"
      redirectPathPrefix="/admin/projects"
      buttonLabel="+ New project"
      errorMessage="Failed to create project"
    />
  );
}
