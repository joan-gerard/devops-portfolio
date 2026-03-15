import { RoadmapCanvas } from "@/components/public/roadmap";
import { getRoadmapData } from "@/lib/queries/roadmap";

export const revalidate = 60;

export const metadata = {
  title: "Roadmap — DevOps Learning Portal",
  description: "My learning roadmap — topics in progress, completed, and planned.",
};

export default async function RoadmapPage() {
  const { items, edges } = await getRoadmapData();

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "48px 24px 24px",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: 28,
            fontWeight: 800,
            color: "var(--text)",
            marginBottom: 8,
          }}
        >
          Learning Roadmap
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--text-muted)",
            marginBottom: 32,
          }}
        >
          Topics and projects — drag to explore, click a node to open its note.
        </p>
      </div>

      {/* Canvas fills the remaining viewport height */}
      <div style={{ height: "calc(100vh - 180px)", width: "100%" }}>
        <RoadmapCanvas items={items} edges={edges} />
      </div>
    </main>
  );
}
