"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import { useCallback, useEffect, useRef } from "react";
import EditorToolbar from "./EditorToolbar";
import { getSharedExtensions } from "@/lib/tipTapExtensions";

type Props = {
  noteId: string;
  content: Record<string, unknown> | undefined;
  onSave?: (status: "saving" | "saved" | "error") => void;
  toolbarTopOffset?: string;
};

export default function TipTapEditor({ noteId, content, onSave, toolbarTopOffset }: Props) {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (json: Record<string, unknown>) => {
      onSave?.("saving");
      try {
        const res = await fetch(`/api/pages/${noteId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: json }),
        });
        if (!res.ok) throw new Error("Save failed");
        onSave?.("saved");
      } catch {
        onSave?.("error");
      }
    },
    [noteId, onSave]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: getSharedExtensions(),
    content: content && Object.keys(content).length > 0 ? content : undefined,
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
    onUpdate: ({ editor }) => {
      // Debounced autosave — fires 1.5s after the user stops typing
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        save(editor.getJSON() as Record<string, unknown>);
      }, 1500);
    },
  });

  // Sync editor content when noteId or content change (e.g. switching notes).
  // Skip when editor is null or user is focused to avoid overwriting in-progress edits.
  useEffect(() => {
    if (!editor) return;
    if (editor.isFocused) return;
    const value = content && Object.keys(content).length > 0 ? content : undefined;
    editor.commands.setContent(value ?? "", { emitUpdate: false });
  }, [editor, content, noteId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "6px",
        background: "var(--surface)",
        /* overflow: visible so EditorToolbar position:sticky can stick to viewport */
      }}
    >
      <EditorToolbar
        editor={editor}
        noteId={noteId}
        stickyTopOffset={toolbarTopOffset ?? "var(--header-height)"}
      />
      <div
        style={{
          overflow: "hidden",
          borderBottomLeftRadius: "6px",
          borderBottomRightRadius: "6px",
        }}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
