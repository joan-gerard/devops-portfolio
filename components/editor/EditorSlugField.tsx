"use client";

import { inputStyle, secondaryButtonStyle } from "./editorStyles";
import { EditorFormField } from "./EditorFormField";

type EditorSlugFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onRegenerateFromTitle: () => void;
  published: boolean;
};

/** Sanitises input to valid slug characters (lowercase, hyphens only). */
function sanitiseSlugInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
}

export function EditorSlugField({
  value,
  onChange,
  onRegenerateFromTitle,
  published,
}: EditorSlugFieldProps) {
  return (
    <EditorFormField
      label="Slug"
      hint={
        published ? "⚠ Changing the slug of a published note will break existing URLs." : undefined
      }
    >
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(sanitiseSlugInput(e.target.value))}
          style={inputStyle}
          placeholder="note-slug"
          aria-label="Note URL slug"
        />
        <button
          type="button"
          onClick={onRegenerateFromTitle}
          title="Regenerate from title"
          style={secondaryButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-muted)";
          }}
        >
          ↺ from title
        </button>
      </div>
    </EditorFormField>
  );
}
