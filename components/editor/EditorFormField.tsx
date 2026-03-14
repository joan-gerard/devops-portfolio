"use client";

import { AdminFormField } from "../shared/AdminFormField";

type EditorFormFieldProps = {
  label: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
};

/**
 * Wraps a form control with a consistent label (and optional hint) for the editor/notes form.
 * Uses shared admin form label style from AdminFormField.
 */
export function EditorFormField({ label, children, hint }: EditorFormFieldProps) {
  return (
    <AdminFormField label={label} hint={hint}>
      {children}
    </AdminFormField>
  );
}
