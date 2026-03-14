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

export function EditorPageClient({ note }: { note: Page }) {
  const {
    title,
    slug,
    saveStatus,
    setSaveStatus,
    published,
    statusColor,
    statusLabel,
    handleTitleChange,
    handleSlugChange,
    handleSlugRegenerate,
    togglePublished,
  } = useEditorPage(note);

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
      />

      <EditorTitleInput value={title} onChange={handleTitleChange} />

      <EditorSlugField
        value={slug}
        onChange={handleSlugChange}
        onRegenerateFromTitle={() => handleSlugRegenerate(slugify(title))}
        published={published}
      />

      <EditorFormField label="Tags">
        <TagInput
          noteId={note.id}
          initial={note.tags}
          onSave={setSaveStatus}
          fieldName="tags"
          apiPath="pages"
        />
      </EditorFormField>

      <TipTapEditor noteId={note.id} content={note.content} onSave={setSaveStatus} />
    </div>
  );
}
