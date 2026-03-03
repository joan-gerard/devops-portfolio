"use client";

import TipTapEditor from "@/components/editor/TipTapEditor";
import { Page } from "@/types/pages";
import { useRef, useState } from "react";

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function EditorPageClient({ note }: { note: Page }) {
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

  const statusColour = {
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

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto" }}>
      {/* Meta bar */}
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
          {/* Save status */}
          {saveStatus !== "idle" && (
            <span style={{ fontSize: "11px", color: statusColour }}>{statusLabel}</span>
          )}

          {/* Publish toggle */}
          <button
            onClick={togglePublished}
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
      </div>

      {/* Title input */}
      <input
        type="text"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (titleTimer.current) clearTimeout(titleTimer.current);
          titleTimer.current = setTimeout(() => saveTitle(e.target.value), 1000);
        }}
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
        placeholder="Untitled"
      />

      {/* Editor */}
      <TipTapEditor noteId={note.id} content={note.content} onSave={setSaveStatus} />
    </div>
  );
}
