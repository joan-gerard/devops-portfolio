"use client";

import { useRef, useState } from "react";
import type { Project } from "@/types/projects";

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "slugSaving" | "slugSaved";

export type ProjectEditFields = {
  title: string;
  slug: string;
  description: string;
  github_url: string;
  live_url: string;
};

/**
 * Debounce delay (ms) before persisting field changes to the API.
 */
const DEBOUNCE_MS = 1000;

const STATUS_COLOUR: Record<SaveStatus, string> = {
  idle: "var(--text-muted)",
  saving: "var(--yellow)",
  saved: "var(--accent)",
  error: "var(--red)",
  slugSaving: "var(--yellow)",
  slugSaved: "var(--accent)",
};

const STATUS_LABEL: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Save failed",
  slugSaving: "Saving slug…",
  slugSaved: "Title slug saved",
};

/**
 * Hook for editing a single project: local form fields, debounced persistence,
 * and save status.
 *
 * Field changes (title, slug, description, github_url, live_url) are persisted
 * via debounced PATCH to `/api/projects/:id`. Published is toggled immediately
 * with no debounce. Exposes status colour/label for the project edit UI.
 *
 * @param project - The project to edit (used as initial state and for API calls).
 * @returns fields and setFields for form state, saveStatus, statusColour/statusLabel,
 *   handleChange(field, value) for debounced updates, handleSlugRegenerate for "from title",
 *   togglePublished, and setSaveStatus.
 */
export function useProjectEdit(project: Project) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [published, setPublished] = useState(project.published);
  const [fields, setFields] = useState<ProjectEditFields>({
    title: project.title,
    slug: project.slug,
    description: project.description,
    github_url: project.github_url ?? "",
    live_url: project.live_url ?? "",
  });

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugRegenerateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function saveField(updated: Partial<ProjectEditFields>) {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  async function saveSlugFromTitle(newSlug: string) {
    setSaveStatus("slugSaving");
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: newSlug }),
      });
      if (!res.ok) throw new Error();
      setSaveStatus("slugSaved");
    } catch {
      setSaveStatus("error");
    }
  }

  function handleChange(field: keyof ProjectEditFields, value: string) {
    setFields((prev) => ({ ...prev, [field]: value }));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveField({ [field]: value });
    }, DEBOUNCE_MS);
  }

  function handleSlugRegenerate(generatedSlug: string) {
    setFields((prev) => ({ ...prev, slug: generatedSlug }));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (slugRegenerateTimer.current) clearTimeout(slugRegenerateTimer.current);
    slugRegenerateTimer.current = setTimeout(() => {
      saveSlugFromTitle(generatedSlug);
    }, DEBOUNCE_MS);
  }

  async function togglePublished() {
    const newValue = !published;
    setPublished(newValue);
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newValue }),
      });
      if (!res.ok) throw new Error();
      setSaveStatus("saved");
    } catch {
      setPublished((prev) => !prev);
      setSaveStatus("error");
    }
  }

  return {
    fields,
    setFields,
    saveStatus,
    setSaveStatus,
    published,
    statusColour: STATUS_COLOUR[saveStatus],
    statusLabel: STATUS_LABEL[saveStatus],
    handleChange,
    handleSlugRegenerate,
    togglePublished,
  };
}
