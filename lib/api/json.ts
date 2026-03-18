import { NextResponse } from "next/server";

type JsonObject = Record<string, unknown>;

export async function parseJsonObject(request: Request): Promise<JsonObject | NextResponse> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
  }

  return body as JsonObject;
}
