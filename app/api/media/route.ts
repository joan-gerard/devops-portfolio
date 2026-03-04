import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sql from "@/lib/db";
import r2 from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawLinkedTo = formData.get("linked_to") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Normalise linked_to — treat empty string as null, validate UUID if present
    const validLinkedTo = rawLinkedTo && rawLinkedTo.trim() !== "" ? rawLinkedTo.trim() : null;

    if (validLinkedTo !== null && !UUID_REGEX.test(validLinkedTo)) {
      return NextResponse.json({ error: "linked_to must be a valid UUID" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Use JPEG, PNG, WebP, or GIF." },
        { status: 400 }
      );
    }

    // Validate file size — 5MB limit
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 5MB." }, { status: 400 });
    }

    // Fail fast if R2 is not configured (avoids opaque AWS errors)
    const bucket = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;
    if (!bucket?.trim() || !publicUrl?.trim()) {
      console.error("POST /api/media: R2_BUCKET_NAME or R2_PUBLIC_URL is missing");
      return NextResponse.json({ error: "Media upload is not configured" }, { status: 503 });
    }

    // Build a unique filename
    const rawExt = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : undefined;
    const ext = rawExt ?? "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const key = `uploads/${filename}`;

    // Upload to R2
    const buffer = Buffer.from(await file.arrayBuffer());
    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const url = `${publicUrl.replace(/\/$/, "")}/${key}`;

    // Record in media table
    await sql`
      INSERT INTO media (filename, url, size, linked_to)
      VALUES (${filename}, ${url}, ${file.size}, ${validLinkedTo})
    `;

    return NextResponse.json({ url, filename }, { status: 201 });
  } catch (error) {
    console.error("POST /api/media error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
