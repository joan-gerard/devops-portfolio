# R2 File Upload Workflow

This document describes how image uploads work in the devops-portfolio app: from the editor UI through the API to Cloudflare R2 and the `media` table. It reflects the implementation introduced in the **allow-file-uploads** branch (commits `cd64cb06`..`84098bf`).

---

## Overview

- **Storage**: Files are stored in **Cloudflare R2** (S3-compatible API), under the `uploads/` prefix with unique filenames.
- **Metadata**: Each upload is recorded in the Postgres **`media`** table (filename, URL, size, optional `linked_to` page UUID).
- **Access**: Uploads are auth-protected; only authenticated admin users can POST to `/api/media`. The resulting URLs are public (R2 public bucket or custom domain).

---

## Architecture

```
┌─────────────────┐     POST /api/media      ┌──────────────────┐     PutObject      ┌─────────────┐
│ EditorToolbar   │ ───────────────────────► │ app/api/media    │ ─────────────────► │ Cloudflare  │
│ (TipTap editor) │   FormData: file,        │ route.ts         │                    │ R2 (bucket) │
└─────────────────┘   linked_to              └────────┬─────────┘                    └─────────────┘
                                                      │
                                                      │ INSERT
                                                      ▼
                                               ┌──────────────┐
                                               │ media table  │
                                               │ (Neon PG)    │
                                               └──────────────┘
```

- **Client**: `components/editor/EditorToolbar.tsx` — “+ Image” button opens a file picker, sends `multipart/form-data` to `/api/media`, then inserts the returned URL into the TipTap document via `setImage({ src: url })`.
- **API**: `app/api/media/route.ts` — validates session, input, and R2 config; uploads to R2; inserts a row into `media`; on DB failure, deletes the R2 object (rollback).
- **R2 client**: `lib/r2.ts` — S3Client configured with `R2_S3_ENDPOINT` and R2 credentials (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`).

---

## Request flow (server)

1. **Auth**  
   `getServerSession(authOptions)` — no session ⇒ `401 Unauthorised`.

2. **Input**
   - `file`: required; must be a single file.
   - `linked_to`: optional; must be a string or omitted. Treated as null if missing or empty; otherwise must be a valid UUID (RFC 4122). Invalid type or malformed UUID ⇒ `400` with a clear message.

3. **File validation**
   - **Type**: allowed MIME types are `image/jpeg`, `image/png`, `image/webp`, `image/gif`.
   - **Size**: max 5 MB.  
     Any violation ⇒ `400`.

4. **R2 configuration check**  
   Before calling the S3 client, the route checks that all required env vars are present and non-empty (after trim):  
   `R2_BUCKET_NAME`, `R2_PUBLIC_URL`, `R2_S3_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`.  
   If any are missing ⇒ `503` with body `{ "error": "Media upload is not configured" }`. This avoids opaque AWS SDK errors when R2 is not set up.

5. **Upload to R2**
   - Unique key: `uploads/{timestamp}-{random}.{ext}` (extension from filename, default `jpg`).
   - `PutObjectCommand` with `Body` (buffer), `ContentType` (from `file.type`), `Bucket`, `Key`.

6. **Database insert**  
   `INSERT INTO media (filename, url, size, linked_to)` with the generated filename, public URL (`R2_PUBLIC_URL` + key), file size, and validated `linked_to` (UUID or null).

7. **Rollback on DB failure**  
   If the `INSERT` throws, the route attempts `DeleteObjectCommand` for the same bucket/key so the R2 object is removed. Rollback failures are logged but do not change the response: the client still receives `500` with `{ "error": "Upload failed" }`.

8. **Success**  
   Response: `201` with `{ "url": "<public URL>", "filename": "<generated filename>" }`.

---

## API contract

| Item         | Detail                                                                                                                           |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Endpoint** | `POST /api/media`                                                                                                                |
| **Auth**     | Session required (admin).                                                                                                        |
| **Request**  | `Content-Type: multipart/form-data`. Fields: `file` (File), `linked_to` (optional string, UUID or empty).                        |
| **Success**  | `201` — `{ "url": string, "filename": string }`.                                                                                 |
| **Errors**   | `401` no session; `400` no file / invalid type or size / invalid `linked_to`; `503` R2 not configured; `500` upload or DB error. |

---

## Environment variables (R2)

Set these where the app runs (e.g. Vercel, `.env.local`):

| Variable               | Purpose                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `R2_BUCKET_NAME`       | R2 bucket name.                                                                                                                |
| `R2_PUBLIC_URL`        | Base URL for public object access (e.g. custom domain or R2 dev URL). Trailing slashes are stripped when building object URLs. |
| `R2_S3_ENDPOINT`       | S3-compatible endpoint (e.g. `https://<account_id>.r2.cloudflarestorage.com`).                                                 |
| `R2_ACCESS_KEY_ID`     | R2 API token access key.                                                                                                       |
| `R2_SECRET_ACCESS_KEY` | R2 API token secret.                                                                                                           |

If any of these are missing or empty, the media route returns `503` and does not call the S3 client. See [Security](#security-and-related-docs) for secret handling.

---

## Database: `media` table

Defined in `migrations/001_init.sql`:

- `id` (UUID, PK, default `uuid_generate_v4()`)
- `filename` (TEXT) — generated name, e.g. `1739123456789-abc12def.jpg`
- `url` (TEXT) — full public URL of the object in R2
- `size` (INTEGER) — file size in bytes
- `linked_to` (UUID, nullable) — optional FK to the page/note the image was uploaded from
- `uploaded_at` (TIMESTAMPTZ, default `NOW()`)

---

## Client integration (EditorToolbar)

- The toolbar is **sticky** (`position: sticky`, `top: var(--header-height)`) so the “+ Image” button stays visible while scrolling. The editor container uses a wrapper with `overflow: hidden` only around the content so the sticky toolbar can stick correctly (`TipTapEditor.tsx`).
- Image upload: user clicks “+ Image” → file input → `FormData` with `file` and `linked_to: noteId` → `fetch("/api/media", { method: "POST", body: formData })`. Response is parsed once; on success the editor runs `setImage({ src: parsed.url })`; on error the client shows `parsed.error` or a generic message (see [security-scan-report.md](security-scan-report.md) for recommendations on not leaking server messages).
- The upload button is disabled while `uploading` is true and shows “Uploading…” during the request.

---

## Security and related docs

- **Auth**: Only authenticated admin users can upload; see [authentication.md](authentication.md) and [security.md](security.md).
- **Validation**: File type (whitelist) and size are enforced; `linked_to` is validated as UUID or null before DB insert. The security scan recommends adding **magic-byte** checks for image content; see [security-scan-report.md](security-scan-report.md) (items 6 and 7).
- **Secrets**: R2 credentials and other secrets must not be committed; use env vars and document them. The route validates R2 env vars before use and returns 503 when configuration is incomplete (addressing scan item 8).

---

## Summary of branch changes (allow-file-uploads)

- **Validation**: `linked_to` must be a string if present; normalized to null when empty; validated with a UUID regex before insert. File extension derived safely from `file.name` (handles missing extension).
- **R2 config**: Full validation of all five R2 env vars before upload; 503 with a clear message when incomplete.
- **Rollback**: On `media` INSERT failure, the uploaded R2 object is deleted via `DeleteObjectCommand` so storage and DB stay consistent.
- **EditorToolbar**: Single response parse; sticky toolbar; “+ Image” label; `type="button"` on the upload button to avoid accidental form submit.
