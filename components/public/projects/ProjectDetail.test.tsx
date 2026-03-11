import { render, screen } from "@/test/test-utils";
import { ProjectDetail } from "./ProjectDetail";
import type { PublicProject } from "@/types/projects";

const mockProject: PublicProject = {
  id: "proj-1",
  title: "My Test Project",
  slug: "my-test-project",
  description: "A project description.",
  tech_stack: ["Docker", "Kubernetes"],
  github_url: "https://github.com/org/repo",
  live_url: "https://example.com",
  updated_at: "2024-06-20T14:00:00Z",
};

describe("ProjectDetail", () => {
  it("shows the project title", () => {
    render(<ProjectDetail project={mockProject} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("My Test Project");
  });

  it("shows the Project label in the header", () => {
    render(<ProjectDetail project={mockProject} />);
    expect(screen.getByText("Project")).toBeInTheDocument();
  });

  it("shows formatted updated date", () => {
    render(<ProjectDetail project={mockProject} />);
    expect(screen.getByText(/Last updated 20 Jun 2024/)).toBeInTheDocument();
  });

  it("shows back link to /projects", () => {
    render(<ProjectDetail project={mockProject} />);
    const link = screen.getByRole("link", { name: /← all projects/i });
    expect(link).toHaveAttribute("href", "/projects");
  });

  it("shows description when present", () => {
    render(<ProjectDetail project={mockProject} />);
    expect(screen.getByText("A project description.")).toBeInTheDocument();
  });

  it("shows tech stack section with labels", () => {
    render(<ProjectDetail project={mockProject} />);
    expect(screen.getByText("Tech stack")).toBeInTheDocument();
    expect(screen.getByText("Docker")).toBeInTheDocument();
    expect(screen.getByText("Kubernetes")).toBeInTheDocument();
  });

  it("shows GitHub and Live links when URLs are present", () => {
    render(<ProjectDetail project={mockProject} />);
    const github = screen.getByRole("link", { name: /github/i });
    const live = screen.getByRole("link", { name: /live demo/i });
    expect(github).toHaveAttribute("href", "https://github.com/org/repo");
    expect(live).toHaveAttribute("href", "https://example.com");
  });
});
