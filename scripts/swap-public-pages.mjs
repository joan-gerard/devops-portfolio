// scripts/swap-public-pages.mjs
import fs from "fs";

const target = process.env.TARGET_ENV; // "dev" | "prod"
if (target !== "dev" && target !== "prod") throw new Error("Invalid TARGET_ENV");

const mappings = [
  // Pattern B: swap in the dev/prod variant file that contains *literal*
  // segment config exports (e.g. `export const revalidate = 60;`) before
  // running `next build`.
  ["app/(public)/page." + target + ".tsx", "app/(public)/page.tsx"],
  ["app/(public)/notes/page." + target + ".tsx", "app/(public)/notes/page.tsx"],
  ["app/(public)/projects/page." + target + ".tsx", "app/(public)/projects/page.tsx"],
  ["app/(public)/about/page." + target + ".tsx", "app/(public)/about/page.tsx"],
  ["app/(public)/roadmap/page." + target + ".tsx", "app/(public)/roadmap/page.tsx"],
  ["app/(public)/notes/[slug]/page." + target + ".tsx", "app/(public)/notes/[slug]/page.tsx"],
  ["app/(public)/projects/[slug]/page." + target + ".tsx", "app/(public)/projects/[slug]/page.tsx"],
];

for (const [from, to] of mappings) {
  fs.copyFileSync(from, to);
}
