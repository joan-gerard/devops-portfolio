import { NextResponse } from "next/server";

type JsonObject = Record<string, unknown>;

const ALLOWED_STATUS = new Set(["not_started", "in_progress", "completed"] as const);
const ALLOWED_TYPES = ["learning", "project", "group"] as const;

type RoadmapStatus = (typeof ALLOWED_STATUS extends Set<infer T> ? T : never) & string;
type RoadmapType = (typeof ALLOWED_TYPES)[number];

export interface RoadmapNodeCreatePayload {
  title: string;
  description?: string | null;
  type: RoadmapType;
  status?: string;
  position_x?: number;
  position_y?: number;
}

export interface RoadmapNodePatchPayload {
  status?: RoadmapStatus;
  position_x?: number;
  position_y?: number;
  title?: string;
  description?: string | null;
  type?: RoadmapType;
  linked_page_id?: string | null;
  is_group_completed?: boolean;
  /**
   * These flags are used to distinguish between a field being explicitly
   * present in the PATCH payload (including `null`) and the field simply
   * not being present at all.
   *
   * This is important for nullable columns: e.g. description can be cleared
   * by sending `description: null`, and the API must not treat that as “no-op”.
   */
  hasTitleField: boolean;
  hasDescriptionField: boolean;
  hasTypeField: boolean;
  hasStatusField: boolean;
  hasPositionXField: boolean;
  hasPositionYField: boolean;
  hasLinkedPageIdField: boolean;
  hasIsGroupCompletedField: boolean;
}

export interface RoadmapEdgeCreatePayload {
  source_id: string;
  target_id: string;
  source_handle?: string | null;
  target_handle?: string | null;
}

export function validateRoadmapNodeCreatePayload(
  body: JsonObject
): RoadmapNodeCreatePayload | NextResponse {
  const { title, description, type, status, position_x, position_y } = body as {
    title?: unknown;
    description?: unknown;
    type?: unknown;
    status?: unknown;
    position_x?: unknown;
    position_y?: unknown;
  };

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const nodeType = (typeof type === "string" ? type : "learning") as string;
  if (!ALLOWED_TYPES.includes(nodeType as RoadmapType)) {
    return NextResponse.json(
      { error: `Invalid type. Allowed: ${ALLOWED_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  return {
    title: title.trim(),
    description:
      typeof description === "string" ? description : description == null ? null : undefined,
    type: nodeType as RoadmapType,
    status: typeof status === "string" ? status : undefined,
    position_x: typeof position_x === "number" ? position_x : undefined,
    position_y: typeof position_y === "number" ? position_y : undefined,
  };
}

export function validateRoadmapNodePatchPayload(
  body: JsonObject
): RoadmapNodePatchPayload | NextResponse {
  const {
    status,
    position_x,
    position_y,
    title,
    description,
    type,
    linked_page_id,
    is_group_completed,
  } = body as {
    status?: unknown;
    position_x?: unknown;
    position_y?: unknown;
    title?: unknown;
    description?: unknown;
    type?: unknown;
    linked_page_id?: unknown;
    is_group_completed?: unknown;
  };

  if (status !== undefined) {
    if (typeof status !== "string" || !ALLOWED_STATUS.has(status as RoadmapStatus)) {
      return NextResponse.json(
        { error: "Invalid status. Allowed: not_started, in_progress, completed" },
        { status: 400 }
      );
    }
  }

  if (type !== undefined) {
    if (typeof type !== "string" || !ALLOWED_TYPES.includes(type as RoadmapType)) {
      return NextResponse.json(
        { error: `Invalid type. Allowed: ${ALLOWED_TYPES.join(", ")}` },
        { status: 400 }
      );
    }
  }

  if (position_x !== undefined && typeof position_x !== "number") {
    return NextResponse.json({ error: "position_x must be a number" }, { status: 400 });
  }

  if (position_y !== undefined && typeof position_y !== "number") {
    return NextResponse.json({ error: "position_y must be a number" }, { status: 400 });
  }

  const recordBody = body as JsonObject;
  const hasTitleField = Object.prototype.hasOwnProperty.call(recordBody, "title");
  const hasDescriptionField = Object.prototype.hasOwnProperty.call(recordBody, "description");
  const hasTypeField = Object.prototype.hasOwnProperty.call(recordBody, "type");
  const hasStatusField = Object.prototype.hasOwnProperty.call(recordBody, "status");
  const hasPositionXField = Object.prototype.hasOwnProperty.call(recordBody, "position_x");
  const hasPositionYField = Object.prototype.hasOwnProperty.call(recordBody, "position_y");
  const hasLinkedPageIdField = Object.prototype.hasOwnProperty.call(recordBody, "linked_page_id");
  const hasIsGroupCompletedField = Object.prototype.hasOwnProperty.call(
    recordBody,
    "is_group_completed"
  );

  if (hasTitleField) {
    if (typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "title must be a non-empty string" }, { status: 400 });
    }
  }

  let normalizedDescription: string | null | undefined = undefined;
  if (hasDescriptionField) {
    if (typeof description === "string") {
      const trimmed = description.trim();
      normalizedDescription = trimmed ? trimmed : null;
    } else if (description === null) {
      normalizedDescription = null;
    } else if (description === undefined) {
      // Explicit `description: undefined` is unusual but treat it as a no-op.
      normalizedDescription = undefined;
    } else {
      return NextResponse.json({ error: "description must be a string or null" }, { status: 400 });
    }
  }

  return {
    status: typeof status === "string" ? (status as RoadmapStatus) : undefined,
    position_x: typeof position_x === "number" ? position_x : undefined,
    position_y: typeof position_y === "number" ? position_y : undefined,
    title: typeof title === "string" ? title.trim() : undefined,
    description: normalizedDescription,
    type: typeof type === "string" ? (type as RoadmapType) : undefined,
    linked_page_id:
      typeof linked_page_id === "string" || linked_page_id === null ? linked_page_id : undefined,
    is_group_completed: typeof is_group_completed === "boolean" ? is_group_completed : undefined,
    hasTitleField,
    hasDescriptionField,
    hasTypeField,
    hasStatusField,
    hasPositionXField,
    hasPositionYField,
    hasLinkedPageIdField,
    hasIsGroupCompletedField,
  };
}

export function validateRoadmapEdgePayload(
  body: JsonObject
): RoadmapEdgeCreatePayload | NextResponse {
  const { source_id, target_id, source_handle, target_handle } = body as {
    source_id?: unknown;
    target_id?: unknown;
    source_handle?: unknown;
    target_handle?: unknown;
  };

  if (typeof source_id !== "string" || typeof target_id !== "string") {
    return NextResponse.json({ error: "source_id and target_id are required" }, { status: 400 });
  }

  return {
    source_id,
    target_id,
    source_handle: typeof source_handle === "string" ? source_handle : null,
    target_handle: typeof target_handle === "string" ? target_handle : null,
  };
}
