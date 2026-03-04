"use client";

import { titleInputStyle } from "./editorStyles";

type EditorTitleInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function EditorTitleInput({
  value,
  onChange,
  placeholder = "Untitled",
}: EditorTitleInputProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={titleInputStyle}
      placeholder={placeholder}
      aria-label="Note title"
    />
  );
}
