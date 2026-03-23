"use client";

import { useRef, useState } from "react";
import type { Project } from "@/types/projects";
import { DEBOUNCE_MS, STATUS_COLOR, STATUS_LABEL } from "@/lib/adminSave";
import type { SaveStatus } from "@/lib/adminSave";
import type { RoadmapItemStatus } from "@/types/roadmap";

export type { SaveStatus } from "@/lib/adminSave";

export type ProjectEditFields = {
  title: string;
  slug: string;
  description: string;
  github_url: string;
  live_url: string;
  roadmap_item_id: string;
};

/**
 * Hook for editing a single project: local form fields, debounced persistence,
 * and save status.
 *
 * Field changes (title, slug, description, github_url, live_url) are persisted
 * via debounced PATCH to `/api/projects/:id`. Published is toggled immediately
 * with no debounce. Exposes status color/label for the project edit UI (EditMetaBar expects statusColor).
 *
 * @param project - The project to edit (used as initial state and for API calls).
 * @returns fields and setFields for form state, saveStatus, statusColor/statusLabel,
 *   handleChange(field, value) for debounced updates, handleSlugRegenerate for "from title",
 *   togglePublished, and setSaveStatus.
 */
export function useProjectEdit(project: Project) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [published, setPublished] = useState(project.published);
  const [linkedRoadmapItemId, setLinkedRoadmapItemId] = useState(project.roadmap_item_id ?? "");
  const [roadmapStatus, setRoadmapStatus] = useState<RoadmapItemStatus | null>(
    project.roadmap_item_status ?? null
  );
  const [roadmapTitle, setRoadmapTitle] = useState(project.roadmap_item_title ?? null);
  const [fields, setFields] = useState<ProjectEditFields>({
    title: project.title,
    slug: project.slug,
    description: project.description,
    github_url: project.github_url ?? "",
    live_url: project.live_url ?? "",
    roadmap_item_id: project.roadmap_item_id ?? "",
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
    if (field === "roadmap_item_id") return;
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
          body: JSON.stringify({ linked_page_id: project.id }),
        });
        if (!linkRes.ok) throw new Error();

        const linkedRoadmapItem = (await linkRes.json()) as {
          status: RoadmapItemStatus;
          title: string;
        };

        if (previousRoadmapItemId && previousRoadmapItemId !== nextRoadmapItemId) {
          try {
            const unlinkRes = await fetch(`/api/roadmap/${previousRoadmapItemId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ linked_page_id: null }),
            });
            if (!unlinkRes.ok) throw new Error();
          } catch {
            await fetch(`/api/roadmap/${nextRoadmapItemId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ linked_page_id: null }),
            });
            throw new Error();
          }
        }

        setLinkedRoadmapItemId(nextRoadmapItemId);
        setFields((prev) => ({ ...prev, roadmap_item_id: nextRoadmapItemId }));
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
        setFields((prev) => ({ ...prev, roadmap_item_id: "" }));
        setRoadmapStatus(null);
        setRoadmapTitle(null);
      }

      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  return {
    fields,
    setFields,
    saveStatus,
    setSaveStatus,
    published,
    statusColor: STATUS_COLOR[saveStatus],
    statusLabel: STATUS_LABEL[saveStatus],
    handleChange,
    handleSlugRegenerate,
    togglePublished,
    roadmapStatus,
    roadmapTitle,
    saveRoadmapLink,
  };
}
