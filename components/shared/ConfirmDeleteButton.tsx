"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export type ConfirmDeleteButtonProps = {
  /** Full URL for the DELETE request (e.g. `/api/pages/${id}` or `/api/projects/${id}`). */
  deleteUrl: string;
  /** If set, router.push(redirectTo) after success; otherwise router.refresh(). */
  redirectTo?: string;
};

const confirmRowStyle: React.CSSProperties = {
  display: "flex",
  gap: "6px",
  alignItems: "center",
};

const baseButtonStyle: React.CSSProperties = {
  fontSize: "11px",
  padding: "3px 8px",
  borderRadius: "3px",
  fontFamily: "var(--font-mono)",
};

const deleteConfirmButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  border: "1px solid var(--red)",
  background: "transparent",
  color: "var(--red)",
  cursor: "pointer",
};

const cancelButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  border: "1px solid var(--border)",
  background: "transparent",
  color: "var(--text-muted)",
  cursor: "pointer",
};

const triggerButtonStyle: React.CSSProperties = {
  ...baseButtonStyle,
  border: "1px solid transparent",
  background: "transparent",
  color: "var(--text-muted)",
  cursor: "pointer",
  transition: "color 0.15s, border-color 0.15s",
};

/**
 * Reusable delete button with confirmation: shows "Sure?" / Delete / Cancel,
 * then sends DELETE to deleteUrl and either redirects or refreshes.
 * Call e.preventDefault() on click so it can be used inside links (e.g. row/card).
 */
export function ConfirmDeleteButton({ deleteUrl, redirectTo }: ConfirmDeleteButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(deleteUrl, { method: "DELETE" });
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
      <div style={confirmRowStyle}>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Sure?</span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          style={{
            ...deleteConfirmButtonStyle,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "..." : "Delete"}
        </button>
        <button type="button" onClick={() => setConfirming(false)} style={cancelButtonStyle}>
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirming(true);
      }}
      style={triggerButtonStyle}
      className="u-text-muted-accent-hover u-border-accent-hover"
    >
      Delete
    </button>
  );
}
