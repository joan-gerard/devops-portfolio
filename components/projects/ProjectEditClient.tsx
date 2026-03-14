"use client";

/**
 * Project edit form (admin). Composes:
 * - useProjectEdit: save state, debounced PATCH, publish toggle
 * - EditMetaBar: back link, status, publish, delete
 * - ProjectEditFormField / ProjectSlugField: labeled fields and slug with regenerate
 * - projectEditStyles: shared input/label/button styles
 */
import { useProjectEdit } from "@/hooks/useProjectEdit";
import { slugify } from "@/lib/slugify";
import type { Project } from "@/types/projects";
import { TagInput } from "../TagInput";
import { EditMetaBar } from "@/components/shared/EditMetaBar";
import { ProjectEditFormField } from "./ProjectEditFormField";
import { ProjectSlugField } from "./ProjectSlugField";
import { DeleteProjectButton } from "./DeleteProjectButton";
import { inputStyle } from "@/components/admin/formStyles";

export function ProjectEditClient({ project }: { project: Project }) {
  const {
    fields,
    saveStatus,
    setSaveStatus,
    published,
    statusColour,
    statusLabel,
    handleChange,
    handleSlugRegenerate,
    togglePublished,
  } = useProjectEdit(project);

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <EditMetaBar
        backHref="/admin/projects"
        backLabel="← Projects"
        saveStatus={saveStatus}
        statusColor={statusColour}
        statusLabel={statusLabel}
        published={published}
        onTogglePublished={togglePublished}
        deleteAction={<DeleteProjectButton id={project.id} redirectTo="/admin/projects" />}
        marginBottom="28px"
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <ProjectEditFormField label="Title">
          <input
            type="text"
            value={fields.title}
            onChange={(e) => handleChange("title", e.target.value)}
            style={inputStyle}
            placeholder="Project title"
            aria-label="Project title"
          />
        </ProjectEditFormField>

        <ProjectSlugField
          value={fields.slug}
          onChange={(value) => handleChange("slug", value)}
          onRegenerateFromTitle={() => handleSlugRegenerate(slugify(fields.title))}
          titleForRegenerate={fields.title}
          published={published}
        />

        <ProjectEditFormField label="Description">
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
            aria-label="Project description"
          />
        </ProjectEditFormField>

        <ProjectEditFormField label="Tech Stack">
          <TagInput
            noteId={project.id}
            initial={project.tech_stack ?? []}
            onSave={setSaveStatus}
            fieldName="tech_stack"
            apiPath="projects"
          />
        </ProjectEditFormField>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <ProjectEditFormField label="GitHub URL">
            <input
              type="url"
              value={fields.github_url}
              onChange={(e) => handleChange("github_url", e.target.value)}
              style={inputStyle}
              placeholder="https://github.com/..."
              aria-label="GitHub URL"
            />
          </ProjectEditFormField>
          <ProjectEditFormField label="Live URL">
            <input
              type="url"
              value={fields.live_url}
              onChange={(e) => handleChange("live_url", e.target.value)}
              style={inputStyle}
              placeholder="https://..."
              aria-label="Live URL"
            />
          </ProjectEditFormField>
        </div>
      </div>
    </div>
  );
}
