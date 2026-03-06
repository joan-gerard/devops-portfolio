import Link from "next/link";

type AdminDashboardOverviewProps = {
  userEmail?: string | null;
  notesPublished: number;
  notesUnpublished: number;
  projectsPublished: number;
  projectsUnpublished: number;
  mediaCount: number;
};

const cardBaseStyle: React.CSSProperties = {
  background: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  padding: "20px",
  display: "block",
  textDecoration: "none",
  color: "inherit",
  transition: "border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease",
};

const cardLinkHoverStyle = `
  .dashboard-card-link:hover {
    border-color: var(--accent);
    background-color: var(--surface-2);
    box-shadow: 0 0 0 1px var(--accent);
    cursor: pointer;
  }
  .dashboard-card-link:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

export function AdminDashboardOverview({
  userEmail,
  notesPublished,
  notesUnpublished,
  projectsPublished,
  projectsUnpublished,
  mediaCount,
}: AdminDashboardOverviewProps) {
  const displayName = userEmail?.trim() || "Admin";

  const hintStyle = {
    fontSize: "10px",
    color: "var(--text-muted)",
    marginTop: "2px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.1em",
  };

  const overviewCards: Array<
    | { label: string; value: number; hint: string; href?: string }
    | { label: string; value: number; unpublished: number; published: number; href?: string }
  > = [
    {
      label: "Notes",
      value: notesPublished + notesUnpublished,
      unpublished: notesUnpublished,
      published: notesPublished,
      href: "/admin/notes",
    },
    {
      label: "Projects",
      value: projectsPublished + projectsUnpublished,
      unpublished: projectsUnpublished,
      published: projectsPublished,
      href: "/admin/projects",
    },
    { label: "Roadmap", value: 0, hint: "completed", href: "/admin/roadmap" },
    { label: "Media", value: mediaCount, hint: "files" },
  ];

  return (
    <div>
      <p
        style={{
          fontSize: "12px",
          color: "var(--text-muted)",
          marginBottom: "32px",
        }}
      >
        Welcome back, <span style={{ color: "var(--accent)" }}>{displayName}</span>
      </p>

      <style dangerouslySetInnerHTML={{ __html: cardLinkHoverStyle }} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "12px",
        }}
      >
        {overviewCards.map((card) => {
          const content = (
            <>
              <div
                style={{
                  fontFamily: "var(--font-syne)",
                  fontSize: "28px",
                  fontWeight: "800",
                  color: "var(--text)",
                  lineHeight: 1,
                  marginBottom: "6px",
                }}
              >
                {card.value}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-dim)" }}>{card.label}</div>
              <div style={hintStyle}>
                {"unpublished" in card ? (
                  <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <span style={{ whiteSpace: "nowrap" }}>unpublished – {card.unpublished}</span>
                    <span style={{ whiteSpace: "nowrap", color: "var(--accent)" }}>
                      published – {card.published}
                    </span>
                  </span>
                ) : (
                  card.hint
                )}
              </div>
            </>
          );
          return card.href ? (
            <Link
              key={card.label}
              href={card.href}
              style={cardBaseStyle}
              className="dashboard-card-link"
            >
              {content}
            </Link>
          ) : (
            <div key={card.label} style={cardBaseStyle}>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
