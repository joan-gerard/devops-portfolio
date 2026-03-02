"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      style={{
        background: "transparent",
        border: "1px solid #232838",
        borderRadius: "4px",
        padding: "6px 12px",
        fontFamily: "monospace",
        fontSize: "11px",
        color: "#6b7280",
        cursor: "pointer",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        transition: "border-color 0.15s, color 0.15s",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = "#f87171";
        el.style.color = "#f87171";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = "#232838";
        el.style.color = "#6b7280";
      }}
    >
      Sign out
    </button>
  );
}
