"use client";

import { labelStyle as defaultLabelStyle } from "@/components/admin/formStyles";

type AdminFormFieldProps = {
  label: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
  /** Optional override; defaults to shared admin form label style. */
  labelStyle?: React.CSSProperties;
};

export function AdminFormField({
  label,
  children,
  hint,
  labelStyle = defaultLabelStyle,
}: AdminFormFieldProps) {
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
