import type { Extensions } from "@tiptap/core";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

/**
 * Shared TipTap extensions used by both the editor and the note renderer (generateHTML).
 * Keeps schema and styles consistent so content edited in the editor renders identically
 * in the read-only note detail view.
 */
export function getSharedExtensions(): Extensions {
  return [
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
}
