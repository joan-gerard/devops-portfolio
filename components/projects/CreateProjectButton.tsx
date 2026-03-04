"use client";

import { slugify } from "@/lib/slugify";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateProjectButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const title = "Untitled Project";
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug: `${slugify(title)}-${Date.now()}`,
        }),
      });
      if (!res.ok) throw new Error("Failed to create project");
      const project = await res.json();
      router.push(`/admin/projects/${project.id}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleCreate}
      disabled={loading}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: loading ? "var(--surface-2)" : "var(--accent)",
        color: loading ? "var(--text-muted)" : "var(--bg)",
        border: "none",
        borderRadius: "4px",
        padding: "7px 14px",
        fontFamily: "var(--font-mono)",
        fontSize: "12px",
        fontWeight: "500",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "background 0.15s",
      }}
    >
      {loading ? "Creating..." : "+ New project"}
    </button>
  );
}
