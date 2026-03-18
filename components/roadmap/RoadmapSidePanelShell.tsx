"use client";

import type { ReactNode } from "react";
import { useEffect, useId, useRef } from "react";

interface RoadmapSidePanelShellProps {
  isOpen: boolean;
  onClose: () => void;
  width?: number;
  header?: ReactNode;
  children: ReactNode;
}

function getFocusableElements(container: HTMLElement) {
  const selector = [
    "a[href]",
    "area[href]",
    'button:not([disabled]):not([aria-disabled="true"])',
    'input:not([disabled]):not([type="hidden"]):not([aria-disabled="true"])',
    'select:not([disabled]):not([aria-disabled="true"])',
    'textarea:not([disabled]):not([aria-disabled="true"])',
    "iframe",
    "object",
    "embed",
    '[contenteditable="true"]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");

  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute("disabled") && el.tabIndex !== -1 && !el.hidden
  );
}

export function RoadmapSidePanelShell({
  isOpen,
  onClose,
  width = 320,
  header,
  children,
}: RoadmapSidePanelShellProps) {
  const headerId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const headerFocusRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const panelEl = panelRef.current;
    if (!panelEl) return;

    const focusTarget =
      getFocusableElements(headerFocusRef.current ?? panelEl)[0] ??
      headerFocusRef.current ??
      panelEl;

    const raf = window.requestAnimationFrame(() => {
      // Let the slide-in transition start before shifting focus.
      try {
        focusTarget.focus({ preventScroll: true });
      } catch {
        focusTarget.focus();
      }
    });

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const container = panelRef.current;
      if (!container) return;

      const focusables = getFocusableElements(container);
      if (focusables.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || active === container) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) return;
    previouslyFocusedRef.current?.focus?.();
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 9,
          }}
        />
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        {...(header ? { "aria-labelledby": headerId } : { "aria-label": "Side panel" })}
        tabIndex={-1}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width,
          background: "var(--surface)",
          borderLeft: "1px solid var(--border)",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.2s ease",
          overflowY: "auto",
        }}
      >
        {header && (
          <div id={headerId} ref={headerFocusRef} tabIndex={-1}>
            {header}
          </div>
        )}
        {children}
      </div>
    </>
  );
}
