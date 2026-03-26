"use client";

/**
 * Note/page editor (admin). Composes:
 * - useEditorPage: title/slug state, debounced PATCH, publish toggle
 * - EditMetaBar: back link, status, publish, delete
 * - EditorTitleInput: large title field
 * - EditorFormField / EditorSlugField: labeled slug with regenerate
 * - editorStyles: shared label/input/button styles
 */
import TipTapEditor from "@/components/editor/TipTapEditor";
import { useEditorPage } from "@/hooks/useEditorPage";
import { slugify } from "@/lib/slugify";
import type { Page } from "@/types/pages";
import { TagInput } from "../TagInput";
import { EditMetaBar } from "@/components/shared/EditMetaBar";
import DeleteNoteButton from "../notes/DeleteNoteButton";
import { EditorFormField } from "./EditorFormField";
import { EditorSlugField } from "./EditorSlugField";
import { EditorTitleInput } from "./EditorTitleInput";
import { inputStyle } from "@/components/admin/formStyles";
import { ROADMAP_STATUS_OPTIONS } from "@/components/roadmap/roadmapStyles";

export function EditorPageClient({ note }: { note: Page }) {
  const {
    title,
    slug,
    summary,
    saveStatus,
    setSaveStatus,
    published,
    statusColor,
    statusLabel,
    handleTitleChange,
    handleSlugChange,
    handleSlugRegenerate,
    handleSummaryChange,
    togglePublished,
    roadmapItemId,
    roadmapStatus,
    roadmapTitle,
    setRoadmapItemId,
    saveRoadmapLink,
  } = useEditorPage(note);
  const roadmapStatusLabel =
    roadmapStatus != null
      ? (ROADMAP_STATUS_OPTIONS.find((option) => option.value === roadmapStatus)?.label ??
        roadmapStatus)
      : null;

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      <EditMetaBar
        backHref="/admin/notes"
        backLabel="← Notes"
        saveStatus={saveStatus}
        statusColor={statusColor}
        statusLabel={statusLabel}
        published={published}
        onTogglePublished={togglePublished}
        deleteAction={<DeleteNoteButton id={note.id} redirectTo="/admin/notes" />}
        sticky
      />

      <EditorTitleInput value={title} onChange={handleTitleChange} />

      <EditorSlugField
        value={slug}
        onChange={handleSlugChange}
        onRegenerateFromTitle={() => handleSlugRegenerate(slugify(title))}
        published={published}
      />

      <EditorFormField label="Summary">
        <textarea
          value={summary}
          onChange={(event) => handleSummaryChange(event.target.value)}
          rows={3}
          style={{
            ...inputStyle,
            resize: "vertical",
            lineHeight: "1.6",
          }}
          placeholder="Short summary shown on cards and listing pages"
          aria-label="Note summary"
        />
      </EditorFormField>

      <EditorFormField label="Tags">
        <TagInput
          noteId={note.id}
          initial={note.tags}
          onSave={setSaveStatus}
          fieldName="tags"
          apiPath="pages"
        />
      </EditorFormField>

      <EditorFormField
        label="Roadmap item ID"
        hint={
          roadmapStatus ? (
            <span style={{ color: "var(--accent)" }}>
              Linked roadmap status: {roadmapStatusLabel}
              {roadmapTitle ? ` (${roadmapTitle})` : ""}
            </span>
          ) : (
            "Optional: paste a roadmap item UUID to link this note."
          )
        }
      >
        <input
          type="text"
          value={roadmapItemId}
          onChange={(event) => setRoadmapItemId(event.target.value)}
          onBlur={() => saveRoadmapLink(roadmapItemId)}
          style={inputStyle}
          placeholder="Roadmap item UUID"
          aria-label="Roadmap item ID"
        />
      </EditorFormField>

      <TipTapEditor
        noteId={note.id}
        content={note.content}
        onSave={setSaveStatus}
        toolbarTopOffset="calc(var(--header-height) + 42px)"
      />
    </div>
  );
}
