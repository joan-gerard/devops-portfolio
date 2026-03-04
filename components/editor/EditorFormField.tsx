"use client";

import { labelStyle } from "./editorStyles";

type EditorFormFieldProps = {
  label: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
};

/**
 * Wraps a form control with a consistent label (and optional hint) for the editor/notes form.
 */
export function EditorFormField({ label, children, hint }: EditorFormFieldProps) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <label style={labelStyle}>{label}</label>
      {children}
      {hint && (
        <p
          style={{
            fontSize: "11px",
            color: "var(--yellow)",
            fontFamily: "var(--font-mono)",
            marginTop: "6px",
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
