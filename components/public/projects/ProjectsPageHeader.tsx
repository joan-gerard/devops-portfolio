import { pageLabel, pageHeading, pageDescription } from "./projectStyles";

export function ProjectsPageHeader() {
  return (
    <div style={{ marginBottom: "48px" }}>
      <p style={pageLabel}>Projects</p>
      <h1 style={pageHeading}>What I&apos;ve been building</h1>
      <p style={pageDescription}>
        Real projects built while learning DevOps — each one documented from infrastructure
        decisions to deployment.
      </p>
    </div>
  );
}
