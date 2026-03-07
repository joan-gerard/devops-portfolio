import Link from "next/link";
import type { FeaturedProject } from "@/types/home";
import { sectionLabel, sectionHeading, viewAllLink, card, tag } from "./sectionStyles";

type FeaturedProjectsSectionProps = { projects: FeaturedProject[] };

export function FeaturedProjectsSection({ projects }: FeaturedProjectsSectionProps) {
  return (
    <section style={{ marginBottom: "72px" }}>
      <p style={sectionLabel}>Projects</p>
      <h2 style={sectionHeading}>What I&apos;ve been building</h2>

      {projects.length === 0 ? (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--text-muted)",
          }}
        >
          No projects published yet.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "12px",
          }}
        >
          {projects.map((project) => (
            <div key={project.id} style={card}>
              <p
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "var(--text)",
                  marginBottom: "8px",
                }}
              >
                {project.title}
              </p>
              {project.description && (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "12px",
                    color: "var(--text-dim)",
                    lineHeight: 1.6,
                    marginBottom: "16px",
                  }}
                >
                  {project.description}
                </p>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "16px" }}>
                {project.tech_stack.slice(0, 4).map((t) => (
                  <span key={t} style={tag}>
                    {t}
                  </span>
                ))}
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      textDecoration: "none",
                    }}
                  >
                    GitHub →
                  </a>
                )}
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--accent)",
                      textDecoration: "none",
                    }}
                  >
                    Live →
                  </a>
                )}
                <Link
                  href={`/projects/${project.slug}`}
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "11px",
                    color: "var(--text-muted)",
                    textDecoration: "none",
                    marginLeft: "auto",
                  }}
                >
                  Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <Link href="/projects" style={viewAllLink}>
        All projects →
      </Link>
    </section>
  );
}
