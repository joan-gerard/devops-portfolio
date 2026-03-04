"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteNoteButton({ id, redirectTo }: { id: string; redirectTo?: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
      setConfirming(false);
    }
  }

  if (confirming) {
    return (
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{
            fontSize: "11px",
            padding: "3px 8px",
            borderRadius: "3px",
            border: "1px solid var(--red)",
            background: "transparent",
            color: "var(--red)",
            fontFamily: "var(--font-mono)",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "..." : "Delete"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          style={{
            fontSize: "11px",
            padding: "3px 8px",
            borderRadius: "3px",
            border: "1px solid var(--border)",
            background: "transparent",
            color: "var(--text-muted)",
            fontFamily: "var(--font-mono)",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // prevent row link navigation
        setConfirming(true);
      }}
      style={{
        fontSize: "11px",
        padding: "3px 8px",
        borderRadius: "3px",
        border: "1px solid transparent",
        background: "transparent",
        color: "var(--text-muted)",
        fontFamily: "var(--font-mono)",
        cursor: "pointer",
        transition: "color 0.15s, border-color 0.15s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--red)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--red)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
        (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
      }}
    >
      Delete
    </button>
  );
}
