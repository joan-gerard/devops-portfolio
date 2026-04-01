"use client";

import { Editor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";

type Props = { editor: Editor | null; noteId: string; stickyTopOffset?: string };

type ToolbarButton = {
  label: string;
  action: () => void;
  isActive?: boolean;
  isDisabled?: boolean;
};

const CODE_LANGUAGES = [
  { label: "Plain", value: "plaintext" },
  { label: "TS/TSX", value: "typescript" },
  { label: "JS/JSX", value: "javascript" },
  { label: "Bash", value: "bash" },
  { label: "Dockerfile", value: "dockerfile" },
  { label: "JSON", value: "json" },
  { label: "YAML", value: "yaml" },
  { label: "Python", value: "python" },
  { label: "SQL", value: "sql" },
] as const;

type CodeLanguageValue = (typeof CODE_LANGUAGES)[number]["value"];

export default function EditorToolbar({
  editor,
  noteId,
  stickyTopOffset = "var(--header-height)",
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [selectedCodeLanguage, setSelectedCodeLanguage] = useState<CodeLanguageValue>("plaintext");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editor) return;

    const syncSelectedLanguage = () => {
      if (!editor.isActive("codeBlock")) return;
      const attrs = editor.getAttributes("codeBlock");
      const rawLanguage = attrs.language;
      if (typeof rawLanguage !== "string" || rawLanguage.length === 0) {
        setSelectedCodeLanguage("plaintext");
        return;
      }
      const isKnown = CODE_LANGUAGES.some((option) => option.value === rawLanguage);
      setSelectedCodeLanguage(isKnown ? (rawLanguage as CodeLanguageValue) : "plaintext");
    };

    syncSelectedLanguage();
    editor.on("selectionUpdate", syncSelectedLanguage);
    editor.on("transaction", syncSelectedLanguage);
    return () => {
      editor.off("selectionUpdate", syncSelectedLanguage);
      editor.off("transaction", syncSelectedLanguage);
    };
  }, [editor]);

  if (!editor) return null;

  const handleCodeBlockToggle = () => {
    editor.chain().focus().setCodeBlock({ language: selectedCodeLanguage }).run();
  };

  const canInsertTable = editor.can().chain().focus().insertTable({ rows: 3, cols: 3 }).run();
  const canAddRowAfter = editor.can().chain().focus().addRowAfter().run();
  const canDeleteRow = editor.can().chain().focus().deleteRow().run();
  const canAddColumnAfter = editor.can().chain().focus().addColumnAfter().run();
  const canDeleteColumn = editor.can().chain().focus().deleteColumn().run();
  const canDeleteTable = editor.can().chain().focus().deleteTable().run();
  const canToggleHeaderRow = editor.can().chain().focus().toggleHeaderRow().run();

  const groups: ToolbarButton[][] = [
    [
      {
        label: "H2",
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: editor.isActive("heading", { level: 2 }),
      },
      {
        label: "H3",
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: editor.isActive("heading", { level: 3 }),
      },
      {
        label: "H4",
        action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
        isActive: editor.isActive("heading", { level: 4 }),
      },
    ],
    [
      {
        label: "B",
        action: () => editor.chain().focus().toggleBold().run(),
        isActive: editor.isActive("bold"),
      },
      {
        label: "I",
        action: () => editor.chain().focus().toggleItalic().run(),
        isActive: editor.isActive("italic"),
      },
      {
        label: "`",
        action: () => editor.chain().focus().toggleCode().run(),
        isActive: editor.isActive("code"),
      },
    ],
    [
      {
        label: "UL",
        action: () => editor.chain().focus().toggleBulletList().run(),
        isActive: editor.isActive("bulletList"),
      },
      {
        label: "OL",
        action: () => editor.chain().focus().toggleOrderedList().run(),
        isActive: editor.isActive("orderedList"),
      },
      {
        label: "❝",
        action: () => editor.chain().focus().toggleBlockquote().run(),
        isActive: editor.isActive("blockquote"),
      },
      {
        label: "</>",
        action: handleCodeBlockToggle,
        isActive: editor.isActive("codeBlock"),
      },
    ],
    [
      {
        label: "Tbl",
        action: () =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
        isDisabled: !canInsertTable,
      },
      {
        label: "Row+",
        action: () => editor.chain().focus().addRowAfter().run(),
        isDisabled: !canAddRowAfter,
      },
      {
        label: "Row-",
        action: () => editor.chain().focus().deleteRow().run(),
        isDisabled: !canDeleteRow,
      },
      {
        label: "Col+",
        action: () => editor.chain().focus().addColumnAfter().run(),
        isDisabled: !canAddColumnAfter,
      },
      {
        label: "Col-",
        action: () => editor.chain().focus().deleteColumn().run(),
        isDisabled: !canDeleteColumn,
      },
      {
        label: "Hdr",
        action: () => editor.chain().focus().toggleHeaderRow().run(),
        isDisabled: !canToggleHeaderRow,
      },
      {
        label: "Tbl-",
        action: () => editor.chain().focus().deleteTable().run(),
        isDisabled: !canDeleteTable,
      },
    ],
  ];

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("linked_to", noteId);

      const res = await fetch("/api/media", { method: "POST", body: formData });
      let parsed: { error?: string; url?: string; filename?: string } = {};

      try {
        parsed = await res.json();
      } catch (parseError) {
        console.error("POST /api/media: response body was not valid JSON:", parseError);
      }

      if (!res.ok) {
        throw new Error(parsed.error ?? "Upload failed — please try a smaller file");
      }

      if (!parsed.url) {
        throw new Error("Upload succeeded but no URL was returned");
      }

      editor.chain().focus().setImage({ src: parsed.url }).run();
    } catch (err) {
      console.error("Image upload failed:", err);
      alert("Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div
      style={{
        position: "sticky",
        top: stickyTopOffset,
        zIndex: 8,
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "8px 16px",
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        flexWrap: "wrap",
      }}
    >
      {groups.map((group, gi) => (
        <div
          key={gi}
          style={{ display: "flex", gap: "2px", marginRight: gi < groups.length - 1 ? "8px" : 0 }}
        >
          {group.map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              title={btn.label}
              disabled={btn.isDisabled}
              style={{
                padding: "4px 8px",
                borderRadius: "3px",
                border: "none",
                background: btn.isActive
                  ? "var(--accent-dim)"
                  : btn.isDisabled
                    ? "var(--surface)"
                    : "transparent",
                color: btn.isActive
                  ? "var(--accent)"
                  : btn.isDisabled
                    ? "var(--text-muted)"
                    : "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: btn.isActive ? "600" : "400",
                cursor: btn.isDisabled ? "not-allowed" : "pointer",
                opacity: btn.isDisabled ? 0.55 : 1,
                transition: "background 0.1s, color 0.1s",
              }}
              className={
                btn.isActive || btn.isDisabled
                  ? undefined
                  : "u-bg-surface-hover u-text-muted-text-hover"
              }
            >
              {btn.label}
            </button>
          ))}
          {gi < groups.length - 1 && (
            <div style={{ width: "1px", background: "var(--border)", margin: "0 4px" }} />
          )}
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span
          style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)" }}
        >
          Lang
        </span>
        <select
          value={selectedCodeLanguage}
          onChange={(event) => {
            const nextLanguage = event.target.value as CodeLanguageValue;
            setSelectedCodeLanguage(nextLanguage);
            if (!editor.isActive("codeBlock")) return;
            editor.chain().focus().updateAttributes("codeBlock", { language: nextLanguage }).run();
          }}
          style={{
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            color: "var(--text-dim)",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            padding: "4px 6px",
            outline: "none",
          }}
          aria-label="Code block language"
        >
          {CODE_LANGUAGES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      {/* Image upload — separate from formatting groups */}
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleImageUpload}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          title="(JPEG, PNG, WebP, GIF — max 4MB)"
          style={{
            padding: "4px 10px",
            borderRadius: "3px",
            border: "1px solid var(--border)",
            background: "transparent",
            color: uploading ? "var(--text-muted)" : "var(--text-dim)",
            fontFamily: "var(--font-mono)",
            fontSize: "11px",
            cursor: uploading ? "not-allowed" : "pointer",
            transition: "background 0.1s, color 0.1s",
          }}
          className={uploading ? undefined : "u-bg-surface-hover u-text-muted-text-hover"}
        >
          {uploading ? "Uploading…" : "+ Image"}
        </button>
      </div>
    </div>
  );
}
