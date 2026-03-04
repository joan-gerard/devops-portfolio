"use client";

import { Editor } from "@tiptap/react";

type Props = { editor: Editor | null };

type ToolbarButton = {
  label: string;
  action: () => void;
  isActive?: boolean;
};

export default function EditorToolbar({ editor }: Props) {
  if (!editor) return null;

  const groups: ToolbarButton[][] = [
    [
      {
        label: "H1",
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: editor.isActive("heading", { level: 1 }),
      },
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
        action: () => editor.chain().focus().toggleCodeBlock().run(),
        isActive: editor.isActive("codeBlock"),
      },
    ],
  ];

  return (
    <div
      style={{
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
              style={{
                padding: "4px 8px",
                borderRadius: "3px",
                border: "none",
                background: btn.isActive ? "var(--accent-dim)" : "transparent",
                color: btn.isActive ? "var(--accent)" : "var(--text-muted)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                fontWeight: btn.isActive ? "600" : "400",
                cursor: "pointer",
                transition: "background 0.1s, color 0.1s",
              }}
              onMouseEnter={(e) => {
                if (!btn.isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--surface-2)";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
                }
              }}
              onMouseLeave={(e) => {
                if (!btn.isActive) {
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)";
                }
              }}
            >
              {btn.label}
            </button>
          ))}
          {gi < groups.length - 1 && (
            <div style={{ width: "1px", background: "var(--border)", margin: "0 4px" }} />
          )}
        </div>
      ))}
    </div>
  );
}
