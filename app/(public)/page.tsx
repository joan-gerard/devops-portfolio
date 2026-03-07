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
  const { notes, projects } = await getHomepageData();

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
