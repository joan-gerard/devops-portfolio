"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

interface RoadmapSidePanelShellProps {
  isOpen: boolean;
  onClose: () => void;
  width?: number;
  header?: ReactNode;
  children: ReactNode;
}

export function RoadmapSidePanelShell({
  isOpen,
  onClose,
  width = 320,
  header,
  children,
}: RoadmapSidePanelShellProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
        {header}
        {children}
      </div>
    </>
  );
}
