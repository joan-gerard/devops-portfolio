"use client";

import { inputStyle, secondaryButtonStyle } from "@/components/admin/formStyles";
import { SlugField } from "@/components/shared/SlugField";
import { slugify } from "@/lib/slugify";

type ProjectSlugFieldProps = {
  value: string;
  onChange: (value: string) => void;
  titleForRegenerate: string;
  published: boolean;
  /** When set, the "from title" button calls this instead of onChange(slugify(title)). Use for slug-specific save messages. */
  onRegenerateFromTitle?: () => void;
};

/** Slug field for the project edit form; thin wrapper around shared SlugField with project styles. */
export function ProjectSlugField({
  value,
  onChange,
  titleForRegenerate,
  published,
  onRegenerateFromTitle,
}: ProjectSlugFieldProps) {
  function handleRegenerate() {
    if (onRegenerateFromTitle) {
      onRegenerateFromTitle();
    } else {
      onChange(slugify(titleForRegenerate));
    }
  }

  return (
    <SlugField
      value={value}
      onChange={onChange}
      onRegenerate={handleRegenerate}
      hint={
        published
          ? "⚠ Changing the slug of a published project will break existing URLs."
          : undefined
      }
      placeholder="project-slug"
      ariaLabel="Project URL slug"
      inputStyle={inputStyle}
      secondaryButtonStyle={secondaryButtonStyle}
    />
  );
}
