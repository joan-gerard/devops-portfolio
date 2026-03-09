"use client";

import type { Project } from "@/types/projects";
import {
  BackToProjectsLink,
  ProjectDescriptionSection,
  ProjectDetailHeader,
  ProjectLinksSection,
  ProjectTechStackSection,
} from "./project-page";

const containerStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "48px 24px 80px",
};

const sectionDividerStyle = {
  border: "none",
  borderTop: "1px solid var(--border)",
  margin: "0 0 32px",
};

type ProjectDetailProps = {
  project: Project;
};

export function ProjectDetail({ project }: ProjectDetailProps) {
  const updatedAt = new Date(project.updated_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div style={containerStyle}>
      <BackToProjectsLink />
      <ProjectDetailHeader title={project.title} updatedAt={updatedAt} />
      <hr style={sectionDividerStyle} />
      <ProjectDescriptionSection description={project.description} />
      <ProjectTechStackSection techStack={project.tech_stack} />
      <ProjectLinksSection githubUrl={project.github_url} liveUrl={project.live_url} />
    </div>
  );
}
