import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Typography from "@tiptap/extension-typography";
import StarterKit from "@tiptap/starter-kit";
import type { Extensions } from "@tiptap/core";
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
  ];
}
