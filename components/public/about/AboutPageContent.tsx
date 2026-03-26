"use client";

import { PublicNote } from "@/types/pages";
import { generateHTML } from "@tiptap/html";
import { useMemo, useSyncExternalStore } from "react";

import { EmptyState } from "@/components/public/EmptyState";
import { PageContainer } from "@/components/public/PageContainer";
import { renderRichContentHtml } from "@/lib/renderRichContentHtml";
import { getSharedExtensions } from "@/lib/tipTapExtensions";

export type AboutPageContentProps = {
  aboutNote: PublicNote | null;
};

export function AboutPageContent({ aboutNote }: AboutPageContentProps) {
  const updatedAt =
    aboutNote &&
    new Date(aboutNote.updated_at).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });

  const output = useMemo(() => {
    const content = aboutNote?.content;
    if (!content || Object.keys(content).length === 0) return "";
    return generateHTML(content as Parameters<typeof generateHTML>[0], getSharedExtensions());
  }, [aboutNote?.content]);

  return (
    <PageContainer>
      <AboutHeader title={aboutNote?.title ?? "About this project"} updatedAt={updatedAt ?? null} />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 40px" }} />
      <AboutBody content={aboutNote?.content} html={output} />
    </PageContainer>
  );
}

type AboutHeaderProps = {
  title: string;
  updatedAt: string | null;
};

function AboutHeader({ title, updatedAt }: AboutHeaderProps) {
  return (
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
          fontFamily: "var(--font-heading)",
          fontSize: "32px",
          fontWeight: "800",
          color: "var(--text)",
          marginBottom: "12px",
          letterSpacing: "-0.02em",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h1>
      {updatedAt && (
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            color: "var(--text-muted)",
          }}
        >
          Last updated {updatedAt}
        </p>
      )}
    </div>
  );
}

type AboutBodyProps = {
  content: Record<string, unknown> | undefined;
  html: string;
};

const aboutEmptyMessageStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  color: "var(--text-muted)",
  marginBottom: "12px",
};

const aboutEmptyHintStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  fontSize: "12px",
  color: "var(--text-muted)",
  lineHeight: 1.7,
  opacity: 0.7,
};

const aboutSlugChipStyle: React.CSSProperties = {
  color: "var(--accent)",
  background: "var(--surface-2)",
  border: "1px solid var(--border)",
  borderRadius: "3px",
  padding: "1px 6px",
};

export const subscribeNever = () => () => {};

export function useIsHydrated() {
  return useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false
  );
}

function AboutBody({ content, html }: AboutBodyProps) {
  const hasContent = content && Object.keys(content).length > 0;
  const isHydrated = useIsHydrated();

  const safeHtml = useMemo(() => {
    if (!hasContent || !html || !isHydrated) return "";
    return renderRichContentHtml(html);
  }, [hasContent, html, isHydrated]);

  if (hasContent && safeHtml) {
    return <div className="note-content" dangerouslySetInnerHTML={{ __html: safeHtml }} />;
  }
  if (hasContent) {
    return <div className="note-content" aria-live="polite" />;
  }
  return (
    <EmptyState style={{ padding: "48px 0", borderRadius: "6px" }}>
      <p style={aboutEmptyMessageStyle}>This page isn&apos;t written yet.</p>
      <p style={aboutEmptyHintStyle}>
        To publish this page: create a note in the admin editor, set its slug to{" "}
        <span style={aboutSlugChipStyle}>about</span>, write your content, then publish it.
      </p>
    </EmptyState>
  );
}
