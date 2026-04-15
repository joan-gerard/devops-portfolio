"use client";

import { useEffect, useRef, useState } from "react";
import type { Page } from "@/types/pages";
import { DEBOUNCE_MS, STATUS_COLOR, STATUS_LABEL } from "@/lib/adminSave";
import type { SaveStatus } from "@/lib/adminSave";
import type { RoadmapItemStatus } from "@/types/roadmap";

export type { SaveStatus } from "@/lib/adminSave";

/**
 * Hook for editing a single page (note) in the editor: local state, debounced
 * persistence, and save status.
 *
 * Metadata fields (title, slug, summary, tags) are persisted via a single
 * debounced PATCH to `/api/pages/:id`. Published is toggled immediately with no
 * debounce. Exposes status color/label for the editor meta bar.
 *
 * @param note - The page to edit (used as initial state and for API calls).
 * @returns Local title/slug state, saveStatus, statusColor/statusLabel, and
 *   handlers: handleTitleChange, handleSlugChange, handleSlugRegenerate,
 *   togglePublished, plus setSaveStatus for external reset.
 */
export function useEditorPage(note: Page) {
  const [title, setTitle] = useState(note.title);
  const [slug, setSlug] = useState(note.slug);
  const [summary, setSummary] = useState(note.summary ?? "");
  const [tags, setTags] = useState(note.tags ?? []);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [published, setPublished] = useState(note.published);
  const [roadmapItemId, setRoadmapItemId] = useState(note.roadmap_item_id ?? "");
  const [linkedRoadmapItemId, setLinkedRoadmapItemId] = useState(note.roadmap_item_id ?? "");
  const [roadmapStatus, setRoadmapStatus] = useState<RoadmapItemStatus | null>(
    note.roadmap_item_status ?? null
  );
  const [roadmapTitle, setRoadmapTitle] = useState(note.roadmap_item_title ?? null);

  const metadataTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingMetadataPatchRef = useRef<
    Partial<Pick<Page, "title" | "slug" | "summary" | "tags">>
  >({});
  const metadataSuccessStatusRef = useRef<"saved" | "slugSaved">("saved");

  async function flushMetadataSave() {
    const patch = pendingMetadataPatchRef.current;
    if (Object.keys(patch).length === 0) return;

    pendingMetadataPatchRef.current = {};
    const successStatus = metadataSuccessStatusRef.current;
    metadataSuccessStatusRef.current = "saved";

    try {
      const res = await fetch(`/api/pages/${note.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error();
      setSaveStatus(successStatus);
    } catch {
      setSaveStatus("error");
    }
  }

  function queueMetadataSave(
    patch: Partial<Pick<Page, "title" | "slug" | "summary" | "tags">>,
    successStatus: "saved" | "slugSaved" = "saved"
  ) {
    pendingMetadataPatchRef.current = {
      ...pendingMetadataPatchRef.current,
      ...patch,
    };
    metadataSuccessStatusRef.current = successStatus;

    if (metadataTimer.current) clearTimeout(metadataTimer.current);
    metadataTimer.current = setTimeout(() => {
      void flushMetadataSave();
    }, DEBOUNCE_MS);
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
    setSaveStatus("saving");
    queueMetadataSave({ title: newTitle });
  }

  function handleSlugChange(newSlug: string) {
    setSlug(newSlug);
    setSaveStatus("saving");
    queueMetadataSave({ slug: newSlug });
  }

  function handleSlugRegenerate(generatedSlug: string) {
    setSlug(generatedSlug);
    setSaveStatus("slugSaving");
    queueMetadataSave({ slug: generatedSlug }, "slugSaved");
  }

  function handleSummaryChange(newSummary: string) {
    setSummary(newSummary);
    setSaveStatus("saving");
    queueMetadataSave({ summary: newSummary });
  }

  function handleTagsChange(newTags: string[]) {
    setTags(newTags);
    setSaveStatus("saving");
    queueMetadataSave({ tags: newTags });
  }

  async function saveRoadmapLink(nextRoadmapItemIdRaw: string) {
    const nextRoadmapItemId = nextRoadmapItemIdRaw.trim();
    const previousRoadmapItemId = linkedRoadmapItemId.trim();
    if (nextRoadmapItemId === previousRoadmapItemId) return;

    setSaveStatus("saving");
    try {
      if (nextRoadmapItemId) {
        const linkRes = await fetch(`/api/roadmap/${nextRoadmapItemId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ linked_page_id: note.id }),
        });
        if (!linkRes.ok) throw new Error();

        const linkedRoadmapItem = (await linkRes.json()) as {
          status: RoadmapItemStatus;
          title: string;
        };

        if (previousRoadmapItemId && previousRoadmapItemId !== nextRoadmapItemId) {
          const unlinkRes = await fetch(`/api/roadmap/${previousRoadmapItemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ linked_page_id: null }),
          });
          if (!unlinkRes.ok) throw new Error();
        }

        setLinkedRoadmapItemId(nextRoadmapItemId);
        setRoadmapItemId(nextRoadmapItemId);
        setRoadmapStatus(linkedRoadmapItem.status);
        setRoadmapTitle(linkedRoadmapItem.title);
      } else {
        if (previousRoadmapItemId) {
          const unlinkRes = await fetch(`/api/roadmap/${previousRoadmapItemId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ linked_page_id: null }),
          });
          if (!unlinkRes.ok) throw new Error();
        }
        setLinkedRoadmapItemId("");
        setRoadmapItemId("");
        setRoadmapStatus(null);
        setRoadmapTitle(null);
      }

      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  useEffect(() => {
    return () => {
      if (metadataTimer.current) clearTimeout(metadataTimer.current);
    };
  }, []);

  return {
    title,
    slug,
    summary,
    tags,
    saveStatus,
    setSaveStatus,
    published,
    statusColor: STATUS_COLOR[saveStatus],
    statusLabel: STATUS_LABEL[saveStatus],
    handleTitleChange,
    handleSlugChange,
    handleSlugRegenerate,
    handleSummaryChange,
    handleTagsChange,
    togglePublished,
    roadmapItemId,
    roadmapStatus,
    roadmapTitle,
    setRoadmapItemId,
    saveRoadmapLink,
  };
}
