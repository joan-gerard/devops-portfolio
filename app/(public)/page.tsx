import {
  FeaturedProjectsSection,
  HeroSection,
  RecentNotesSection,
  RoadmapSection,
  TechStackSection,
} from "@/components/public/home";
import { getHomepageData } from "@/lib/queries/home";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let notes: Awaited<ReturnType<typeof getHomepageData>>["notes"] = [];
  let projects: Awaited<ReturnType<typeof getHomepageData>>["projects"] = [];

  try {
    const data = await getHomepageData();
    notes = data.notes;
    projects = data.projects;
  } catch (err) {
    console.error("[HomePage] getHomepageData failed:", err);
    // Fallback: empty arrays; sections already render "No notes/projects published yet"
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px 80px" }}>
      <HeroSection />
      <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0 0 72px" }} />
      <RecentNotesSection notes={notes} />
      <FeaturedProjectsSection projects={projects} />
      <RoadmapSection />
      <TechStackSection />
    </div>
  );
}
