"use client";

import { slugify } from "@/lib/slugify";
import { Project } from "@/types/projects";
import { useRef, useState } from "react";
import { TagInput } from "../editor";
import { DeleteProjectButton } from "./DeleteProjectButton";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const inputStyle = {
  width: "100%",
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  padding: "9px 12px",
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: "var(--text)",
  outline: "none",
  boxSizing: "border-box" as const,
  transition: "border-color 0.15s",
};

const labelStyle = {
  display: "block" as const,
  fontSize: "10px",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  color: "var(--text-muted)",
  marginBottom: "6px",
  fontFamily: "var(--font-mono)",
};

export function ProjectEditClient({ project }: { project: Project }) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [published, setPublished] = useState(project.published);
  const [fields, setFields] = useState({
    title: project.title,
    slug: project.slug,
    description: project.description,
    github_url: project.github_url ?? "",
    live_url: project.live_url ?? "",
  });

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function saveField(updated: Partial<typeof fields>) {
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      setSaveStatus("saved");
    } catch {
      setSaveStatus("error");
    }
  }

  function handleChange(field: keyof typeof fields, value: string) {
    setFields((prev) => ({ ...prev, [field]: value }));
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveField({ [field]: value });
    }, 1000);
  }

  async function togglePublished() {
    const newValue = !published;
    setPublished(newValue);
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: newValue }),
      });
      if (!res.ok) throw new Error();
      setSaveStatus("saved");
    } catch {
      setPublished(!newValue);
      setSaveStatus("error");
    }
  }

  const statusColour = {
    idle: "var(--text-muted)",
    saving: "var(--yellow)",
    saved: "var(--accent)",
    error: "var(--red)",
  }[saveStatus];

  const statusLabel = {
    idle: "",
    saving: "Saving…",
    saved: "Saved",
    error: "Save failed",
  }[saveStatus];

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      {/* Meta bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
        }}
      >
        <a
          href="/admin/projects"
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            textDecoration: "none",
            letterSpacing: "0.06em",
          }}
        >
          ← Projects
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {saveStatus !== "idle" && (
            <span style={{ fontSize: "11px", color: statusColour }}>{statusLabel}</span>
          )}
          <button
            onClick={togglePublished}
            style={{
              fontSize: "11px",
              padding: "5px 12px",
              borderRadius: "4px",
              border: "1px solid var(--border)",
              background: published ? "var(--accent-dim)" : "var(--surface)",
              color: published ? "var(--accent)" : "var(--text-muted)",
              fontFamily: "var(--font-mono)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {published ? "Published" : "Publish"}
          </button>
          <DeleteProjectButton id={project.id} redirectTo="/admin/projects" />
        </div>
      </div>

      {/* Form fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Title */}
        <div>
          <label style={labelStyle}>Title</label>
          <input
            type="text"
            value={fields.title}
            onChange={(e) => handleChange("title", e.target.value)}
            style={inputStyle}
            placeholder="Project title"
          />
        </div>

        {/* Slug */}
        <div>
          <label style={labelStyle}>Slug</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              value={fields.slug}
              onChange={(e) => {
                // Sanitise on input — only allow valid slug characters
                const sanitised = e.target.value
                  .toLowerCase()
                  .replace(/[^a-z0-9-]/g, "-")
                  .replace(/-+/g, "-");
                handleChange("slug", sanitised);
              }}
              style={inputStyle}
              placeholder="project-slug"
            />
            <button
              onClick={() => {
                const generated = slugify(fields.title);
                handleChange("slug", generated);
              }}
              title="Regenerate from title"
              style={{
                flexShrink: 0,
                padding: "9px 12px",
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                color: "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border)";
                (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
              }}
            >
              ↺ from title
            </button>
          </div>
          {published && (
            <p
              style={{
                fontSize: "11px",
                color: "var(--yellow)",
                fontFamily: "var(--font-mono)",
                marginTop: "6px",
              }}
            >
              ⚠ Changing the slug of a published project will break existing URLs.
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            value={fields.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={4}
            style={{
              ...inputStyle,
              resize: "vertical",
              lineHeight: "1.6",
            }}
            placeholder="What did you build and why? What problems did it solve?"
          />
        </div>

        {/* Tech stack */}
        <div>
          <label style={labelStyle}>Tech Stack</label>
          <TagInput
            noteId={project.id}
            initial={project.tech_stack ?? []}
            onSave={setSaveStatus}
            fieldName="tech_stack"
            apiPath="projects"
          />
        </div>

        {/* URLs */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={labelStyle}>GitHub URL</label>
            <input
              type="url"
              value={fields.github_url}
              onChange={(e) => handleChange("github_url", e.target.value)}
              style={inputStyle}
              placeholder="https://github.com/..."
            />
          </div>
          <div>
            <label style={labelStyle}>Live URL</label>
            <input
              type="url"
              value={fields.live_url}
              onChange={(e) => handleChange("live_url", e.target.value)}
              style={inputStyle}
              placeholder="https://..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
