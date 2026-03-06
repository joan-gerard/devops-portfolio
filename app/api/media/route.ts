import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import sql from "@/lib/db";
import r2 from "@/lib/r2";
import { detectMimeFromBytes } from "@/lib/validateFileBytes"; // ← new import
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
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
    const linkedToEntry = formData.get("linked_to");
    if (linkedToEntry !== null && typeof linkedToEntry !== "string") {
      return NextResponse.json({ error: "linked_to must be a string UUID" }, { status: 400 });
    }

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Normalise linked_to — treat empty string as null, validate UUID if present
    const normalizedLinkedTo = linkedToEntry?.trim() ?? "";
    const validLinkedTo = normalizedLinkedTo !== "" ? normalizedLinkedTo : null;

    if (validLinkedTo !== null && !UUID_REGEX.test(validLinkedTo)) {
      return NextResponse.json({ error: "linked_to must be a valid UUID" }, { status: 400 });
    }

    // Validate file type — cheap check on client-provided MIME before reading buffer
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "File type not allowed. Use JPEG, PNG, WebP, or GIF." },
        { status: 400 }
      );
    }

    // Validate file size — 4MB limit (safely under Vercel's 4.5MB body limit)
    const maxSize = 4 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large. Maximum size is 4MB." }, { status: 400 });
    }

    // Fail fast if R2 is not configured (avoids opaque AWS errors)
    // Validate all R2 config here — credentials and endpoint are consumed by
    // lib/r2.ts but we surface misconfiguration with a clear 503 rather than
    // an opaque AWS SDK error from deep inside the client
    const bucket = process.env.R2_BUCKET_NAME?.trim();
    const publicUrl = process.env.R2_PUBLIC_URL?.trim();
    const endpoint = process.env.R2_S3_ENDPOINT?.trim();
    const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
    if (!bucket || !publicUrl || !endpoint || !accessKeyId || !secretAccessKey) {
      console.error("POST /api/media: R2 configuration is incomplete");
      return NextResponse.json({ error: "Media upload is not configured" }, { status: 503 });
    }

    // Read buffer once — used for magic byte validation and R2 upload
    const buffer = Buffer.from(await file.arrayBuffer()); // ← moved up from below

    // Validate actual file content against magic bytes — client-provided file.type
    // cannot be trusted; a malicious client can set any Content-Type
    const detectedMime = detectMimeFromBytes(buffer);
    if (!detectedMime) {
      return NextResponse.json(
        { error: "File type not allowed. Use JPEG, PNG, WebP, or GIF." },
        { status: 400 }
      );
    }
    if (detectedMime !== file.type) {
      return NextResponse.json(
        { error: "File content does not match declared type." },
        { status: 400 }
      );
    }

    // Build a unique filename
    const rawExt = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : undefined;
    const ext = rawExt ?? "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const key = `uploads/${filename}`;

    // Upload to R2
    await r2.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer, // ← reuses the buffer already read above
        ContentType: file.type,
      })
    );

    const url = `${publicUrl.replace(/\/$/, "")}/${key}`;

    // Record in media table — if this fails, clean up the R2 object immediately
    try {
      await sql`
        INSERT INTO media (filename, url, size, linked_to)
        VALUES (${filename}, ${url}, ${file.size}, ${validLinkedTo})
      `;
    } catch (dbError) {
      console.error("POST /api/media: DB insert failed, rolling back R2 object:", dbError);
      try {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          })
        );
      } catch (r2Error) {
        console.error("POST /api/media: R2 rollback also failed:", r2Error);
      }
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
    return NextResponse.json({ url, filename }, { status: 201 });
  } catch (error) {
    console.error("POST /api/media error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
