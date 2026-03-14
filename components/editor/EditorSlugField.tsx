"use client";

import { SlugField } from "@/components/shared/SlugField";
import { inputStyle, secondaryButtonStyle } from "./editorStyles";

type EditorSlugFieldProps = {
  value: string;
  onChange: (value: string) => void;
  onRegenerateFromTitle: () => void;
  published: boolean;
};

/** Slug field for the note/page editor; thin wrapper around shared SlugField with editor styles. */
export function EditorSlugField({
  value,
  onChange,
  onRegenerateFromTitle,
  published,
}: EditorSlugFieldProps) {
  return (
    <SlugField
      value={value}
      onChange={onChange}
      onRegenerate={onRegenerateFromTitle}
      hint={
        published ? "⚠ Changing the slug of a published note will break existing URLs." : undefined
      }
      placeholder="note-slug"
      ariaLabel="Note URL slug"
      inputStyle={inputStyle}
      secondaryButtonStyle={secondaryButtonStyle}
    />
  );
}
