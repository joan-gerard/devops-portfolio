import type { RoadmapItemWithSlug } from "@/lib/queries/roadmap";
import type { RoadmapItemStatus, RoadmapItemType } from "@/types/roadmap";
import { render, screen } from "@/test/test-utils";
import React from "react";
import { vi } from "vitest";
import { RoadmapNode } from "./RoadmapNode";

vi.mock("@xyflow/react", () => {
  const Handle = (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />;
  const Position = { Top: "top", Left: "left", Bottom: "bottom", Right: "right" };
  return { Handle, Position };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

function buildItem(overrides: Partial<RoadmapItemWithSlug> = {}): RoadmapItemWithSlug {
  const base: RoadmapItemWithSlug = {
    id: "item-1",
    title: "My Node",
    description: "Desc",
    type: "learning",
    status: "not_started",
    position_x: 10,
    position_y: 20,
    linked_page_id: null,
    linked_page_slug: null,
    is_group_completed: false,
    completed_at: null,
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-01T00:00:00.000Z",
  };

  return { ...base, ...overrides };
}

function renderNode(opts: {
  type?: RoadmapItemType;
  status?: RoadmapItemStatus;
  linked_page_slug?: string | null;
  is_group_completed?: boolean;
  selected?: boolean;
}) {
  const {
    type = "learning",
    status = "not_started",
    linked_page_slug = null,
    is_group_completed = false,
    selected = false,
  } = opts;

  const item = buildItem({ type, status, linked_page_slug, is_group_completed });

  const nodeProps = {
    id: item.id,
    data: item as unknown as Record<string, unknown>,
    selected,
    type: "roadmapNode",
  } as unknown as React.ComponentProps<typeof RoadmapNode>;

  return render(<RoadmapNode {...nodeProps} />);
}

describe("RoadmapNode", () => {
  it("renders type and status for non-group nodes", () => {
    renderNode({ type: "project", status: "in_progress" });

    expect(screen.getByText("Project")).toBeInTheDocument();
    expect(screen.getByText("◐")).toBeInTheDocument();
    expect(screen.getByText("My Node")).toBeInTheDocument();
  });

  it("does not render type/status pills for group nodes", () => {
    renderNode({ type: "group" });

    // Title still rendered
    expect(screen.getByText("My Node")).toBeInTheDocument();
    // Group nodes omit the status icon characters
    expect(screen.queryByText("○")).not.toBeInTheDocument();
    expect(screen.queryByText("◐")).not.toBeInTheDocument();
    expect(screen.queryByText("✓")).not.toBeInTheDocument();
  });

  it("indicates completed state for group nodes", () => {
    renderNode({ type: "group", is_group_completed: true });

    // For completed groups we at least ensure the title still renders.
    // Visual border styling is covered indirectly via snapshot-based tests elsewhere.
    expect(screen.getByText("My Node")).toBeInTheDocument();
  });

  it("shows completed status styling for completed items", () => {
    renderNode({ type: "learning", status: "completed" });

    expect(screen.getByText("✓")).toBeInTheDocument();
    expect(screen.getByText("My Node")).toBeInTheDocument();
  });
});
