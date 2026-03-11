import { render, screen } from "@/test/test-utils";
import { ProjectsGrid } from "./ProjectsGrid";
import type { PublishedProject } from "@/lib/queries/project";

const mockProject: PublishedProject = {
  id: "proj-1",
  title: "Test Project",
  slug: "test-project",
  description: "A test project",
  tech_stack: ["Docker"],
  github_url: null,
  live_url: null,
};

describe("ProjectsGrid", () => {
  it("shows empty state when projects list is empty", () => {
    render(<ProjectsGrid projects={[]} />);
    expect(screen.getByText("No projects published yet — check back soon.")).toBeInTheDocument();
  });

  it("renders the correct number of project cards when data is present", () => {
    const projects: PublishedProject[] = [
      mockProject,
      { ...mockProject, id: "proj-2", title: "Second", slug: "second" },
    ];
    render(<ProjectsGrid projects={projects} />);
    expect(screen.getByText("Test Project")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.queryByText("No projects published yet")).not.toBeInTheDocument();
  });
});
