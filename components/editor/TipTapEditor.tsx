"use client";

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { useCallback, useEffect, useRef } from "react";
import EditorToolbar from "./EditorToolbar";

const lowlight = createLowlight(common);

type Props = {
  noteId: string;
  content: Record<string, unknown>;
  onSave?: (status: "saving" | "saved" | "error") => void;
};

export default function TipTapEditor({ noteId, content, onSave }: Props) {
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
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replaced by lowlight version
      }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({
        placeholder: "Start writing…",
      }),
      Typography,
      Image.configure({
        HTMLAttributes: {
          class: "tiptap-image",
        },
      }),
    ],
    content: Object.keys(content).length > 0 ? content : undefined,
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
        overflow: "hidden",
        background: "var(--surface)",
      }}
    >
      <EditorToolbar editor={editor} noteId={noteId} />
      <EditorContent editor={editor} />
    </div>
  );
}
