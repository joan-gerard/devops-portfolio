import type { RoadmapItemWithSlug } from "@/lib/queries/roadmap";
import type { RoadmapEdge } from "@/types/roadmap";
import { RoadmapCanvas } from "./RoadmapCanvas";

interface Props {
  items: RoadmapItemWithSlug[];
  edges: RoadmapEdge[];
}

export function PublicRoadmapLayout({ items, edges }: Props) {
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

      <div style={{ height: "calc(100vh - 180px)", width: "100%" }}>
        <RoadmapCanvas items={items} edges={edges} />
      </div>
    </main>
  );
}
