import Link from "next/link";

export function HeroSection() {
  return (
    <section style={{ padding: "80px 0 72px" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--accent)",
          marginBottom: "16px",
          letterSpacing: "0.1em",
        }}
      >
        Hi, I&apos;m
      </p>
      <h1
        style={{
          fontFamily: "var(--font-syne)",
          fontSize: "clamp(36px, 6vw, 64px)",
          fontWeight: "800",
          color: "var(--text)",
          lineHeight: 1.05,
          marginBottom: "20px",
          letterSpacing: "-0.02em",
        }}
      >
        Joan Gerard
      </h1>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "16px",
          color: "var(--text-dim)",
          maxWidth: "540px",
          lineHeight: 1.7,
          marginBottom: "36px",
        }}
      >
        Learning DevOps in public — documenting everything from CI/CD to cloud infrastructure as I
        build real projects.
      </p>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <Link
          href="/projects"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--bg)",
            background: "var(--accent)",
            padding: "10px 20px",
            borderRadius: "4px",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          View Projects
        </Link>
        <Link
          href="/notes"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "13px",
            color: "var(--text)",
            background: "transparent",
            border: "1px solid var(--border)",
            padding: "10px 20px",
            borderRadius: "4px",
            textDecoration: "none",
          }}
        >
          Read Notes
        </Link>
      </div>
    </section>
  );
}
