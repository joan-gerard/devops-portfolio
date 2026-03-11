"use client";

import { labelStyle } from "./editorStyles";
import { AdminFormField } from "../shared/AdminFormField";

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
    <AdminFormField label={label} hint={hint} labelStyle={labelStyle}>
      {children}
    </AdminFormField>
  );
}
