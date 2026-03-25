import { render, screen } from "@/test/test-utils";
import { FeaturedProjectsSection } from "./FeaturedProjectsSection";
import type { FeaturedProject } from "@/types/home";

const mockProject: FeaturedProject = {
  id: "proj-1",
  title: "Featured Project",
  slug: "featured-project",
  description: "A featured project",
  tech_stack: ["Kubernetes"],
  github_url: null,
  live_url: null,
  updated_at: "2024-06-01T12:00:00Z",
};

describe("FeaturedProjectsSection", () => {
  it("shows correct section label and heading", () => {
    render(<FeaturedProjectsSection projects={[]} />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("What I've been building");
  });

  it("shows empty message when projects list is empty", () => {
    render(<FeaturedProjectsSection projects={[]} />);
    expect(screen.getByText("No projects published yet.")).toBeInTheDocument();
  });

  it("renders the right number of project cards when data is present", () => {
    const projects: FeaturedProject[] = [
      mockProject,
      { ...mockProject, id: "proj-2", title: "Second Project", slug: "second-project" },
    ];
    render(<FeaturedProjectsSection projects={projects} />);
    const cards = screen.getAllByTestId("project-card");
    expect(cards).toHaveLength(projects.length);
    expect(screen.getByText("Featured Project")).toBeInTheDocument();
    expect(screen.getByText("Second Project")).toBeInTheDocument();
    expect(screen.queryByText("No projects published yet.")).not.toBeInTheDocument();
  });

  it("shows All projects link to /projects", () => {
    render(<FeaturedProjectsSection projects={[]} />);
    const link = screen.getByRole("link", { name: /all projects/i });
    expect(link).toHaveAttribute("href", "/projects");
  });
});
