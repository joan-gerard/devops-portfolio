import type { RoadmapPhase } from "@/types/home";

/** Tech stack items shown on the public homepage. */
export const TECH_STACK = [
  "Next.js",
  "TypeScript",
  "PostgreSQL",
  "Neon",
  "Cloudflare R2",
  "Vercel",
  "Docker",
  "GitHub Actions",
] as const;

/** Roadmap phases for the homepage "Where I'm at" section. */
export const ROADMAP_PHASES: RoadmapPhase[] = [
  { num: "00", label: "Planning", done: true },
  { num: "01", label: "Foundation", done: true },
  { num: "02", label: "Authentication", done: true },
  { num: "03", label: "Admin Dashboard & Content API", done: true },
  { num: "04", label: "Security Hardening", done: true },
  { num: "05", label: "Public Portfolio", done: false },
  { num: "06", label: "Roadmap", done: false },
  { num: "07", label: "DevOps & Infrastructure", done: false },
  { num: "08", label: "Polish & Pre-Launch", done: false },
  { num: "09", label: "Post Launch", done: false },
];
