"use client";

import { KeyboardEvent, useRef, useState } from "react";

type Props = {
  noteId: string;
  initial: string[];
  onSave?: (status: "saving" | "saved" | "error") => void;
};

export function TagInput({ noteId, initial, onSave }: Props) {
  const [tags, setTags] = useState<string[]>(initial ?? []);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function saveTags(updated: string[]) {
    onSave?.("saving");
    try {
      const res = await fetch(`/api/pages/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: updated }),
      });
      if (!res.ok) throw new Error();
      onSave?.("saved");
    } catch {
      onSave?.("error");
    }
  }

  function addTag(raw: string) {
    const tag = raw
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    if (!tag || tags.includes(tag)) {
      setInput("");
      return;
    }
    const updated = [...tags, tag];
    setTags(updated);
    setInput("");
    saveTags(updated);
  }

  function removeTag(tag: string) {
    const updated = tags.filter((t) => t !== tag);
    setTags(updated);
    saveTags(updated);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
    if (e.key === "Backspace" && input === "" && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "6px",
        padding: "8px 12px",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "4px",
        cursor: "text",
        minHeight: "36px",
      }}
    >
      {tags.map((tag) => (
        <span
          key={tag}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "11px",
            padding: "2px 8px",
            borderRadius: "2px",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--text-dim)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {tag}
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "0",
              fontSize: "12px",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = "var(--red)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)")
            }
          >
            ×
          </button>
        </span>
      ))}

      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (input.trim()) addTag(input);
        }}
        placeholder={tags.length === 0 ? "Add tags…" : ""}
        style={{
          flex: 1,
          minWidth: "80px",
          background: "transparent",
          border: "none",
          outline: "none",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          color: "var(--text)",
        }}
      />
    </div>
  );
}
