import { PublicRoadmapLayout } from "@/components/roadmap/public";
import { getRoadmapData } from "@/lib/queries/roadmap";

export const revalidate = 60;

export const metadata = {
  title: "Roadmap — DevOps Learning Portal",
  description: "My learning roadmap — topics in progress, completed, and planned.",
};

export default async function RoadmapPage() {
  const { items, edges } = await getRoadmapData();

  return <PublicRoadmapLayout items={items} edges={edges} />;
}
