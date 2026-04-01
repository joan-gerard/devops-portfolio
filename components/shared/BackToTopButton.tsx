"use client";

import { useEffect, useState } from "react";

export type BackToTopButtonProps = {
  /** Scroll offset (px) before the button becomes visible. Default 120. */
  scrollThreshold?: number;
  /** Visible label next to the arrow. Default "Top". */
  label?: string;
  /** Extra class names merged onto the root button (after base styles). */
  className?: string;
};

/**
 * Fixed bottom-center control that appears after the user scrolls down and smooth-scrolls to the top on click.
 * Styling uses `.back-to-top-btn` / `.back-to-top-btn--visible` in `app/globals.css`.
 */
export function BackToTopButton({
  scrollThreshold = 120,
  label = "Top",
  className,
}: BackToTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const getScrollTop = () => {
      return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    };

    const onScroll = () => {
      setVisible(getScrollTop() > scrollThreshold);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollThreshold]);

  const handleClick = () => {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const rootClass = ["back-to-top-btn", visible ? "back-to-top-btn--visible" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={rootClass}
      onClick={handleClick}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <span aria-hidden="true">↑</span>
      <span>{label}</span>
    </button>
  );
}
