"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      style={{
        background: "transparent",
        borderRadius: "4px",
        padding: "6px 12px",
        fontFamily: "monospace",
        fontSize: "11px",
        cursor: "pointer",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
      className="u-text-muted-accent-hover u-border-accent-hover"
    >
      Sign out
    </button>
  );
}
