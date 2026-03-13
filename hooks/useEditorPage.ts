"use client";

import { useRef, useState } from "react";
import type { Page } from "@/types/pages";

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "slugSaving" | "slugSaved";

/**
 * Debounce delay (ms) before persisting title/slug changes to the API.
 */
const DEBOUNCE_MS = 1000;

const STATUS_COLOR: Record<SaveStatus, string> = {
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
 * Hook for editing a single page (note) in the editor: local state, debounced
 * persistence, and save status.
 *
 * Title and slug are persisted via debounced PATCH to `/api/pages/:id`. Published
 * is toggled immediately with no debounce. Exposes status color/label for the
 * editor meta bar.
 *
 * @param note - The page to edit (used as initial state and for API calls).
 * @returns Local title/slug state, saveStatus, statusColor/statusLabel, and
 *   handlers: handleTitleChange, handleSlugChange, handleSlugRegenerate,
 *   togglePublished, plus setSaveStatus for external reset.
 */
export function useEditorPage(note: Page) {
  const [title, setTitle] = useState(note.title);
  const [slug, setSlug] = useState(note.slug);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [published, setPublished] = useState(note.published);

  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function saveTitle(newTitle: string) {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/pages/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error();
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  async function saveSlugFromInput(newSlug: string) {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/pages/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: newSlug }),
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
      const res = await fetch(`/api/pages/${note.id}`, {
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

  async function togglePublished() {
    const newValue = !published;
    setPublished(newValue);
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/pages/${note.id}`, {
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

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    if (titleTimer.current) clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(() => saveTitle(newTitle), DEBOUNCE_MS);
  }

  function handleSlugChange(newSlug: string) {
    setSlug(newSlug);
    if (slugTimer.current) clearTimeout(slugTimer.current);
    slugTimer.current = setTimeout(() => saveSlugFromInput(newSlug), DEBOUNCE_MS);
  }

  function handleSlugRegenerate(generatedSlug: string) {
    setSlug(generatedSlug);
    if (slugTimer.current) clearTimeout(slugTimer.current);
    slugTimer.current = setTimeout(() => saveSlugFromTitle(generatedSlug), DEBOUNCE_MS);
  }

  return {
    title,
    slug,
    saveStatus,
    setSaveStatus,
    published,
    statusColor: STATUS_COLOR[saveStatus],
    statusLabel: STATUS_LABEL[saveStatus],
    handleTitleChange,
    handleSlugChange,
    handleSlugRegenerate,
    togglePublished,
  };
}
