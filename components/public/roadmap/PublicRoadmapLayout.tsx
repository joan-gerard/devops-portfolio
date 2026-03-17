import type { RoadmapItemWithSlug } from "@/lib/queries/roadmap";
import type { RoadmapEdge } from "@/types/roadmap";
import {
  ROADMAP_PAGE_CONTAINER_STYLE,
  ROADMAP_PAGE_HEADING_STYLE,
  ROADMAP_PAGE_SUBHEADING_STYLE,
} from "@/components/roadmap/roadmapStyles";
import { RoadmapCanvas } from "./RoadmapCanvas";

interface Props {
  items: RoadmapItemWithSlug[];
  edges: RoadmapEdge[];
}

export function PublicRoadmapLayout({ items, edges }: Props) {
  return (
    <main style={{ background: "var(--bg)" }} id="roadmap-main-container">
      <div style={ROADMAP_PAGE_CONTAINER_STYLE}>
        <h1 style={ROADMAP_PAGE_HEADING_STYLE}>Learning Roadmap</h1>
        <p style={ROADMAP_PAGE_SUBHEADING_STYLE}>
          Topics and projects — drag to explore, click a node to open its note.
        </p>
      </div>

      <div style={{ height: "calc(100vh - 300px)", width: "100%" }} id="roadmap-canvas-container">
        <RoadmapCanvas items={items} edges={edges} />
      </div>
    </main>
  );
}
