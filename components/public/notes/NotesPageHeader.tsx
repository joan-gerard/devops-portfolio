/**
 * Header section for the public Notes page: label, title, and description.
 */
export function NotesPageHeader() {
  return (
    <div style={{ marginBottom: "48px" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          marginBottom: "12px",
        }}
      >
        Notes
      </p>
      <h1
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "32px",
          fontWeight: "800",
          color: "var(--text)",
          marginBottom: "12px",
          letterSpacing: "-0.02em",
        }}
      >
        What I&apos;ve been learning
      </h1>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          color: "var(--text-dim)",
          maxWidth: "480px",
          lineHeight: 1.7,
        }}
      >
        Notes written while working through my DevOps course — covering infrastructure, security,
        tooling, and everything in between.
      </p>
    </div>
  );
}
