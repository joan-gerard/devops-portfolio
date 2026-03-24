"use client";

import { PageContainer } from "@/components/public/PageContainer";
import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const isProd = process.env.NODE_ENV === "production";

function reportPublicErrorDigest(error: Error & { digest?: string }) {
  const payload = {
    name: error.name,
    digest: error.digest ?? "unknown",
  };

  // TODO: wire up to real monitoring pipeline (e.g. Sentry, Datadog)
  // This intentionally avoids logging the raw Error object or stack trace.
  console.error("[PublicErrorDigest]", payload);
}

/**
 * Route-level error boundary for the public segment.
 * Catches uncaught errors during render and shows a fallback UI.
 */
export default function PublicError({ error, reset }: ErrorProps) {
  useEffect(() => {
    if (!isProd) {
      console.error("[PublicError]", error);
      return;
    }

    reportPublicErrorDigest(error);
  }, [error]);

  return (
    <PageContainer style={{ padding: "80px 24px", textAlign: "center" }}>
      <h1
        style={{
          fontFamily: "var(--font-heading)",
          fontSize: "1.5rem",
          marginBottom: "12px",
        }}
      >
        Something went wrong
      </h1>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          color: "var(--text-muted)",
          marginBottom: "24px",
        }}
      >
        We couldn&apos;t load this page. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "13px",
          padding: "8px 16px",
          background: "var(--border)",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </PageContainer>
  );
}
