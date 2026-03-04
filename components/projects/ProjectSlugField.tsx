"use client";

import { slugify } from "@/lib/slugify";
import { ProjectEditFormField } from "./ProjectEditFormField";
import { inputStyle, secondaryButtonStyle } from "./projectEditStyles";

type ProjectSlugFieldProps = {
  value: string;
  onChange: (value: string) => void;
  titleForRegenerate: string;
  published: boolean;
};

/** Sanitises input to valid slug characters (lowercase, hyphens only). */
function sanitiseSlugInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
}

export function ProjectSlugField({
  value,
  onChange,
  titleForRegenerate,
  published,
}: ProjectSlugFieldProps) {
  function handleRegenerate() {
    onChange(slugify(titleForRegenerate));
  }

  return (
    <ProjectEditFormField
      label="Slug"
      hint={
        published
          ? "⚠ Changing the slug of a published project will break existing URLs."
          : undefined
      }
    >
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(sanitiseSlugInput(e.target.value))}
          style={inputStyle}
          placeholder="project-slug"
          aria-label="Project URL slug"
        />
        <button
          type="button"
          onClick={handleRegenerate}
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
    </ProjectEditFormField>
  );
}
