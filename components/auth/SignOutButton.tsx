"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
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
        (e.target as HTMLButtonElement).style.borderColor = "#f87171";
        (e.target as HTMLButtonElement).style.color = "#f87171";
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.borderColor = "#232838";
        (e.target as HTMLButtonElement).style.color = "#6b7280";
      }}
    >
      Sign out
    </button>
  );
}
