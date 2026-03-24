import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { RoadmapEditor } from "@/components/roadmap";
import { getRoadmapData } from "@/lib/queries/roadmap";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Roadmap Editor — Admin",
};

export default async function RoadmapEditPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { items, edges } = await getRoadmapData();

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--surface)",
          flexShrink: 0,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: 16,
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
            }}
          >
            Roadmap Editor
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--text-muted)",
              margin: "2px 0 0",
            }}
          >
            Drag to reposition · Click to edit · Draw connections between nodes · Select edge +
            Delete to remove
          </p>
        </div>
        <a
          href="/admin"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--text-muted)",
            textDecoration: "none",
          }}
        >
          ← Dashboard
        </a>
      </div>

      {/* Canvas fills remaining height */}
      <div style={{ flex: 1, overflow: "hidden" }}>
        <RoadmapEditor initialItems={items} initialEdges={edges} />
      </div>
    </div>
  );
}
