import Link from "next/link";

export function BackToProjectsLink() {
  return (
    <Link href="/projects" className="notes-back-link u-text-muted-accent-hover">
      ← All projects
    </Link>
  );
}
