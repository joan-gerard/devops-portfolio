import type { RoadmapEdge, RoadmapItemWithSlug } from "@/types/roadmap";
import { render, screen } from "@/test/test-utils";
import { describe, expect, it, vi } from "vitest";
import { PublicRoadmapLayout } from "./PublicRoadmapLayout";

vi.mock("./RoadmapCanvas", () => ({
  RoadmapCanvas: ({ items, edges }: { items: RoadmapItemWithSlug[]; edges: RoadmapEdge[] }) => (
    <div data-testid="roadmap-canvas-mock">
      canvas items:{items.length} edges:{edges.length}
    </div>
  ),
}));

function buildItem(id: string): RoadmapItemWithSlug {
  return {
    id,
    title: `Node ${id}`,
    description: null,
    type: "learning",
    status: "not_started",
    position_x: 0,
    position_y: 0,
    linked_page_id: null,
    linked_page_slug: null,
    is_group_completed: false,
    completed_at: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  };
}

function buildEdge(id: string): RoadmapEdge {
  return {
    id,
    source_id: "a",
    target_id: "b",
    source_handle: null,
    target_handle: null,
    created_at: "2024-01-01T00:00:00.000Z",
  };
}

describe("PublicRoadmapLayout", () => {
  it("renders heading, description and passes data to canvas", () => {
    const items = [buildItem("1"), buildItem("2")];
    const edges = [buildEdge("e1")];

    render(<PublicRoadmapLayout items={items} edges={edges} />);

    expect(screen.getByRole("heading", { name: /Learning Roadmap/i })).toBeInTheDocument();
    expect(screen.getByText(/Topics and projects — drag to explore/i)).toBeInTheDocument();

    const canvas = screen.getByTestId("roadmap-canvas-mock");
    expect(canvas).toHaveTextContent("canvas items:2");
    expect(canvas).toHaveTextContent("edges:1");
  });
});
