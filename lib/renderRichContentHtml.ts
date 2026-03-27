import createDOMPurify from "dompurify";
import hljs from "highlight.js/lib/common";

import { stripXmlnsAttributes } from "@/lib/stripXmlnsAttributes";

function getCodeLanguageLabel(language: string | undefined): string | null {
  if (!language || language === "plaintext") return null;

  switch (language) {
    case "typescript":
      return "TS/TSX";
    case "javascript":
      return "JS/JSX";
    case "bash":
      return "Bash";
    case "dockerfile":
      return "Dockerfile";
    case "json":
      return "JSON";
    case "yaml":
      return "YAML";
    case "python":
      return "Python";
    case "sql":
      return "SQL";
    default:
      return language.toUpperCase();
  }
}

/**
 * Client-side only helper that sanitizes editor HTML, applies code highlighting/badges,
 * and strips serializer XML namespaces.
 *
 * This function depends on browser-only APIs (`window`, `DOMParser`) and must not run
 * during SSR. Callers should guard usage with hydration checks (for example, `isHydrated`).
 */
export function renderRichContentHtml(html: string): string {
  const sanitized = createDOMPurify(window).sanitize(html);
  const document = new DOMParser().parseFromString(sanitized, "text/html");
  const codeBlocks = document.querySelectorAll("pre code");

  codeBlocks.forEach((block) => {
    const classNames = block.className.split(/\s+/).filter(Boolean);
    const languageClass = classNames.find((name) => name.startsWith("language-"));
    const language = languageClass?.replace("language-", "");
    const languageLabel = getCodeLanguageLabel(language);
    const sourceCode = block.textContent ?? "";

    try {
      const highlighted =
        language && hljs.getLanguage(language)
          ? hljs.highlight(sourceCode, { language, ignoreIllegals: true }).value
          : hljs.highlightAuto(sourceCode).value;
      block.innerHTML = highlighted;
      block.classList.add("hljs");
    } catch {
      // Keep original text content as fallback if highlight parsing fails.
    }

    if (languageLabel) {
      const preEl = block.closest("pre");
      if (preEl && !preEl.querySelector(".code-lang-badge")) {
        const computedPosition = window.getComputedStyle(preEl).position;
        if (computedPosition === "" || computedPosition === "static") {
          preEl.style.position = "relative";
        }

        const badge = document.createElement("div");
        badge.className = "code-lang-badge";
        badge.textContent = languageLabel;
        badge.style.position = "absolute";
        badge.style.top = "8px";
        badge.style.right = "12px";
        badge.style.zIndex = "2";
        badge.style.background = "var(--surface-2)";
        badge.style.border = "1px solid var(--border)";
        badge.style.color = "var(--text-muted)";
        badge.style.borderRadius = "4px";
        badge.style.padding = "1px 6px";
        badge.style.fontSize = "10px";
        badge.style.textTransform = "uppercase";
        badge.style.letterSpacing = "0.06em";
        badge.style.pointerEvents = "none";

        // Insert as first child so it never ends up in normal flow.
        preEl.insertBefore(badge, preEl.firstChild);
      }
    }
  });

  stripXmlnsAttributes(document);

  return document.body.innerHTML;
}
