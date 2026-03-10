import { getNoteBySlug } from "@/lib/queries/page";
import Image from "@tiptap/extension-image";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";

export const revalidate = 3600;

export const metadata = {
  title: "About — DevOps Learning Portal",
};

const TIPTAP_EXTENSIONS = [StarterKit, Image];

export default async function AboutPage() {
  const note = await getNoteBySlug("about");

  let html = "";
  if (note?.content && Object.keys(note.content).length > 0) {
    try {
      html = generateHTML(note.content as Parameters<typeof generateHTML>[0], TIPTAP_EXTENSIONS);
    } catch {
      html = "";
    }
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 24px 80px" }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: "32px" }}>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: "12px",
          }}
        >
          About
        </p>
        <h1
          style={{
            fontFamily: "var(--font-syne)",
            fontSize: "32px",
            fontWeight: "800",
            color: "var(--text)",
            marginBottom: "12px",
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}
        >
          {note?.title ?? "About this project"}
        </h1>
        {note && (
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              color: "var(--text-muted)",
            }}
          >
            Last updated{" "}
            {new Date(note.updated_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 40px" }} />

      {/* ── Content ───────────────────────────────────────────────────────── */}
      {html ? (
        <div className="note-content" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div
          style={{
            padding: "48px 0",
            borderRadius: "6px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "13px",
              color: "var(--text-muted)",
              marginBottom: "12px",
            }}
          >
            This page isn&apos;t written yet.
          </p>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              color: "var(--text-muted)",
              lineHeight: 1.7,
              opacity: 0.7,
            }}
          >
            To publish this page: create a note in the admin editor, set its slug to{" "}
            <span
              style={{
                color: "var(--accent)",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                borderRadius: "3px",
                padding: "1px 6px",
              }}
            >
              about
            </span>
            , write your content, then publish it.
          </p>
        </div>
      )}
    </div>
  );
}
