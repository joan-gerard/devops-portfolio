"use client";

import { slugify } from "@/lib/slugify";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type CreateEntityButtonProps = {
  /** API path for the POST request (e.g. "/api/pages" or "/api/projects"). */
  apiPath: string;
  /** Default title sent in the request body. */
  defaultTitle: string;
  /** Redirect path prefix; after create we redirect to `${redirectPathPrefix}/${response.id}` (no trailing slash). */
  redirectPathPrefix: string;
  /** Button label when idle (e.g. "+ New note"). */
  buttonLabel: string;
  /** Label shown while the request is in progress. Defaults to "Creating...". */
  creatingLabel?: string;
  /** Error message when the API returns !res.ok. Defaults to "Failed to create". */
  errorMessage?: string;
};

const buttonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  border: "none",
  borderRadius: "4px",
  padding: "7px 14px",
  fontFamily: "var(--font-mono)",
  fontSize: "12px",
  fontWeight: "500",
  transition: "background 0.15s",
};

/**
 * Reusable "create entity" button: POSTs { title, slug } to apiPath (slug = slugify(defaultTitle) + "-" + Date.now()),
 * then redirects to redirectPathPrefix/${response.id}. Use for notes, projects, or any similar admin create flow.
 */
export function CreateEntityButton({
  apiPath,
  defaultTitle,
  redirectPathPrefix,
  buttonLabel,
  creatingLabel = "Creating...",
  errorMessage = "Failed to create",
}: CreateEntityButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const slug = `${slugify(defaultTitle)}-${Date.now()}`;
      const res = await fetch(apiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: defaultTitle, slug }),
      });

      if (!res.ok) throw new Error(errorMessage);

      const entity = (await res.json()) as { id: string };
      router.push(`${redirectPathPrefix}/${entity.id}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCreate}
      disabled={loading}
      style={{
        ...buttonStyle,
        background: loading ? "var(--surface-2)" : "var(--accent)",
        color: loading ? "var(--text-muted)" : "var(--bg)",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? creatingLabel : buttonLabel}
    </button>
  );
}
