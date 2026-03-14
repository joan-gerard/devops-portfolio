"use client";

import { AdminFormField } from "../shared/AdminFormField";

type ProjectEditFormFieldProps = {
  label: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
};

/**
 * Wraps a form control with a consistent label (and optional hint) for the project edit form.
 * Uses shared admin form label style from AdminFormField.
 */
export function ProjectEditFormField({ label, children, hint }: ProjectEditFormFieldProps) {
  return (
    <AdminFormField label={label} hint={hint}>
      {children}
    </AdminFormField>
  );
}
