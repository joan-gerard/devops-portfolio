"use client";

import { useEffect } from "react";

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Route-level error boundary for the public segment.
 * Catches uncaught errors during render and shows a fallback UI.
 */
export default function PublicError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("[PublicError]", error);
  }, [error]);

  return (
    <div
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "80px 24px",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-syne)",
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
    </div>
  );
}
