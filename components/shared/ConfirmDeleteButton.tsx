"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiOutlineTrash } from "react-icons/hi2";

export type ConfirmDeleteButtonProps = {
  /** Full URL for the DELETE request (e.g. `/api/pages/${id}` or `/api/projects/${id}`). */
  deleteUrl: string;
  /** If set, router.push(redirectTo) after success; otherwise router.refresh(). */
  redirectTo?: string;
  /** Accessible and modal label for the entity being deleted. */
  itemLabel?: string;
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
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "22px",
  height: "22px",
  padding: 0,
  border: "1px solid transparent",
  background: "transparent",
  color: "var(--red)",
  cursor: "pointer",
  transition: "color 0.15s, border-color 0.15s, background 0.15s",
};

/**
 * Reusable delete button with confirmation: shows "Sure?" / Delete / Cancel,
 * then sends DELETE to deleteUrl and either redirects or refreshes.
 * Call e.preventDefault() on click so it can be used inside links (e.g. row/card).
 */
export function ConfirmDeleteButton({
  deleteUrl,
  redirectTo,
  itemLabel,
}: ConfirmDeleteButtonProps) {
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
  const modalTitle = "Confirm deletion";
  const modalDescription = `Delete this ${itemLabel ?? "item"}? This action cannot be undone.`;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setConfirming(true);
        }}
        aria-label={`Delete ${itemLabel ?? "item"}`}
        title={`Delete ${itemLabel ?? "item"}`}
        style={triggerButtonStyle}
        className="u-border-accent-hover"
      >
        <HiOutlineTrash size={15} aria-hidden />
      </button>

      {confirming && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={modalTitle}
          onClick={() => setConfirming(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <h2
                style={{ fontSize: "16px", fontFamily: "var(--font-syne)", color: "var(--text)" }}
              >
                {modalTitle}
              </h2>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{modalDescription}</p>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button type="button" onClick={() => setConfirming(false)} style={cancelButtonStyle}>
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                style={{
                  ...deleteConfirmButtonStyle,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
