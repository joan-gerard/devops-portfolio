"use client";

import { sanitiseSlugForInput } from "@/lib/slugify";
import type { CSSProperties } from "react";
import { AdminFormField } from "./AdminFormField";

export type SlugFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onRegenerate: () => void;
  hint?: React.ReactNode;
  placeholder: string;
  ariaLabel: string;
  inputStyle: CSSProperties;
  secondaryButtonStyle: CSSProperties;
};

/**
 * Shared slug field: label, input (sanitised via sanitiseSlugForInput), and "↺ from title" button.
 * Used by EditorSlugField and ProjectSlugField with context-specific styles and hint text.
 */
export function SlugField({
  value,
  onChange,
  onRegenerate,
  hint,
  placeholder,
  ariaLabel,
  inputStyle,
  secondaryButtonStyle,
}: SlugFieldProps) {
  return (
    <AdminFormField label="Slug" hint={hint}>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(sanitiseSlugForInput(e.target.value))}
          style={inputStyle}
          placeholder={placeholder}
          aria-label={ariaLabel}
        />
        <button
          type="button"
          onClick={onRegenerate}
          title="Regenerate from title"
          style={secondaryButtonStyle}
          className="u-text-muted-accent-hover u-border-accent-hover"
        >
          ↺ from title
        </button>
      </div>
    </AdminFormField>
  );
}
