import type { RoadmapItemWithSlug } from "@/types/roadmap";
import { render, screen } from "@/test/test-utils";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { AdminRoadmapNode } from "./AdminRoadmapNode";

vi.mock("@xyflow/react", () => {
  const Handle = (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />;
  const Position = { Top: "top", Left: "left", Bottom: "bottom", Right: "right" };
  return { Handle, Position };
});

function buildItem(overrides: Partial<RoadmapItemWithSlug> = {}): RoadmapItemWithSlug {
  const base: RoadmapItemWithSlug = {
    id: "item-1",
    title: "My Node",
    description: null,
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

function renderNode(itemOverrides: Partial<RoadmapItemWithSlug>) {
  const item = buildItem(itemOverrides);
  const nodeProps = {
    id: item.id,
    data: item as unknown as Record<string, unknown>,
    selected: false,
    type: "adminRoadmapNode",
  } as unknown as React.ComponentProps<typeof AdminRoadmapNode>;

  return render(<AdminRoadmapNode {...nodeProps} />);
}

describe("AdminRoadmapNode", () => {
  it("renders icon-only indicators for linked page and description", () => {
    renderNode({
      linked_page_slug: "my-linked-note",
      description: "Has some description",
    });

    expect(screen.getByLabelText("Linked page added")).toBeInTheDocument();
    expect(screen.getByLabelText("Description added")).toBeInTheDocument();

    // Ensure we do not render the previous text label.
    expect(screen.queryByText(/linked/i)).not.toBeInTheDocument();
  });

  it("does not render indicators when neither linked page nor description exist", () => {
    renderNode({ linked_page_slug: null, description: null });

    expect(screen.queryByLabelText("Linked page added")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Description added")).not.toBeInTheDocument();
  });
});
