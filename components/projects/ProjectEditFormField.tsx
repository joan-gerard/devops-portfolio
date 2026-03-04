"use client";

import { labelStyle } from "./projectEditStyles";

type ProjectEditFormFieldProps = {
  label: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
};

/**
 * Wraps a form control with a consistent label (and optional hint) for the project edit form.
 */
export function ProjectEditFormField({ label, children, hint }: ProjectEditFormFieldProps) {
  return (
    <div>
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
