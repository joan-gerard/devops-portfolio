"use client";

import TipTapEditor from "@/components/editor/TipTapEditor";
import { Page } from "@/types/pages";
import { useRef, useState } from "react";
import DeleteNoteButton from "../notes/DeleteNoteButton";
import { TagInput } from "./TagInput";

type SaveStatus = "idle" | "saving" | "saved" | "error";

// --- EditorMetaBar: back link, save status, publish toggle ---
type EditorMetaBarProps = {
  saveStatus: SaveStatus;
  noteId: string;
  statusColor: string;
  statusLabel: string;
  published: boolean;
  onTogglePublished: () => void;
};

export function EditorPageClient({ note }: { note: Page }) {
  const [title, setTitle] = useState(note.title);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [published, setPublished] = useState(note.published);
  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      setPublished(!newValue); // revert on error
      setSaveStatus("error");
    }
  }

  const statusColor = {
    idle: "var(--text-muted)",
    saving: "var(--yellow)",
    saved: "var(--accent)",
    error: "var(--red)",
  }[saveStatus];

  const statusLabel = {
    idle: "",
    saving: "Saving…",
    saved: "Saved",
    error: "Save failed",
  }[saveStatus];

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    if (titleTimer.current) clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(() => saveTitle(newTitle), 1000);
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      <EditorMetaBar
        saveStatus={saveStatus}
        noteId={note.id}
        statusColor={statusColor}
        statusLabel={statusLabel}
        published={published}
        onTogglePublished={togglePublished}
      />
      <EditorTitleInput value={title} onChange={handleTitleChange} />
      <div style={{ marginBottom: "20px" }}>
        <label
          style={{
            display: "block",
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: "6px",
            fontFamily: "var(--font-mono)",
          }}
        >
          Tags
        </label>
        <TagInput noteId={note.id} initial={note.tags} onSave={setSaveStatus} />
      </div>
      <TipTapEditor noteId={note.id} content={note.content} onSave={setSaveStatus} />
    </div>
  );
}

function EditorMetaBar({
  saveStatus,
  noteId,
  statusColor,
  statusLabel,
  published,
  onTogglePublished,
}: EditorMetaBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
      }}
    >
      <a
        href="/admin/notes"
        style={{
          fontSize: "11px",
          color: "var(--text-muted)",
          textDecoration: "none",
          letterSpacing: "0.06em",
        }}
      >
        ← Notes
      </a>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {saveStatus !== "idle" && (
          <span style={{ fontSize: "11px", color: statusColor }}>{statusLabel}</span>
        )}
        <button
          onClick={onTogglePublished}
          style={{
            fontSize: "11px",
            padding: "5px 12px",
            borderRadius: "4px",
            border: "1px solid var(--border)",
            background: published ? "var(--accent-dim)" : "var(--surface)",
            color: published ? "var(--accent)" : "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {published ? "Published" : "Publish"}
        </button>
      </div>
      <DeleteNoteButton id={noteId} redirectTo="/admin/notes" />
    </div>
  );
}

// --- EditorTitleInput: main title field ---
type EditorTitleInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function EditorTitleInput({ value, onChange, placeholder = "Untitled" }: EditorTitleInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        background: "transparent",
        border: "none",
        outline: "none",
        fontFamily: "var(--font-syne)",
        fontSize: "32px",
        fontWeight: "800",
        color: "var(--text)",
        letterSpacing: "-0.02em",
        marginBottom: "20px",
        padding: 0,
      }}
      placeholder={placeholder}
    />
  );
}
