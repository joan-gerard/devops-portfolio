import type { Extensions } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { TableOfContents, type TableOfContentData } from "@tiptap/extension-table-of-contents";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

type SharedExtensionsOptions = {
  tableOfContents?: {
    onUpdate: (anchors: TableOfContentData) => void;
    getId: (textContent: string) => string;
  };
};

/**
 * Shared TipTap extensions used by both the editor and the note renderer (generateHTML).
 * Keeps schema and styles consistent so content edited in the editor renders identically
 * in the read-only note detail view.
 */
export function getSharedExtensions(options: SharedExtensionsOptions = {}): Extensions {
  const extensions: Extensions = [
    StarterKit.configure({
      codeBlock: false, // replaced by CodeBlockLowlight
    }),
    CodeBlockLowlight.configure({ lowlight }),
    Placeholder.configure({
      placeholder: "Start writing…",
    }),
    Typography,
    Image.configure({
      HTMLAttributes: {
        class: "tiptap-image",
      },
    }),
    Table.configure({
      resizable: true,
      HTMLAttributes: {
        class: "tiptap-table",
      },
    }),
    TableRow,
    TableHeader,
    TableCell,
  ];

  if (options.tableOfContents) {
    extensions.push(
      TableOfContents.configure({
        anchorTypes: ["heading"],
        getId: options.tableOfContents.getId,
        onUpdate: (anchors) => options.tableOfContents?.onUpdate(anchors),
      })
    );
  }

  return extensions;
}
