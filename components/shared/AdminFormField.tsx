"use client";

type AdminFormFieldProps = {
  label: string;
  children: React.ReactNode;
  hint?: React.ReactNode;
  labelStyle: React.CSSProperties;
};

export function AdminFormField({ label, children, hint, labelStyle }: AdminFormFieldProps) {
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
