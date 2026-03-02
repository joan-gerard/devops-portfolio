"use client";

import { useState } from "react";

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "monospace",
  fontSize: "11px",
  color: "#6b7280",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#13161d",
  border: "1px solid #232838",
  borderRadius: "4px",
  padding: "10px 12px",
  fontFamily: "monospace",
  fontSize: "13px",
  color: "#e8eaf0",
  outline: "none",
  boxSizing: "border-box",
};

/** Eye icon for "show password" state */
function EyeIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

/** Eye-off icon for "hide password" state */
function EyeOffIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

type LoginFormFieldProps = {
  id: string;
  label: string;
  type: "email" | "password";
  value: string;
  onChange: (value: string) => void;
  marginBottom?: "16px" | "24px";
};

export function LoginFormField({
  id,
  label,
  type,
  value,
  onChange,
  marginBottom = "16px",
}: LoginFormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div style={{ marginBottom }}>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          style={{
            ...inputStyle,
            ...(isPassword ? { paddingRight: "40px" } : {}),
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            title={showPassword ? "Hide password" : "Show password"}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              padding: "4px",
              cursor: "pointer",
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseDown={(e) => e.preventDefault()}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
    </div>
  );
}
