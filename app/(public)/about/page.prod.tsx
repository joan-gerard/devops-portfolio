import { getNoteBySlug } from "@/lib/queries/page";

import { AboutPageContent } from "@/components/public/about/AboutPageContent";

export const revalidate = false;

export const metadata = {
  title: "About — DevOps Learning Portal",
};

export default async function AboutPage() {
  const aboutNote = await getNoteBySlug("about");
  return <AboutPageContent aboutNote={aboutNote} />;
}
