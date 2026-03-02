import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/admin/login");

  return (
    <div>
      <p
        style={{
          fontSize: "12px",
          color: "var(--text-muted)",
          marginBottom: "32px",
        }}
      >
        Welcome back, <span style={{ color: "var(--accent)" }}>{session.user?.email}</span>
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "12px",
        }}
      >
        {[
          { label: "Notes", value: "0", hint: "published" },
          { label: "Projects", value: "0", hint: "live" },
          { label: "Roadmap", value: "0", hint: "completed" },
          { label: "Media", value: "0", hint: "files" },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              padding: "20px",
            }}
          >
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
            <div
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                marginTop: "2px",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {card.hint}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
