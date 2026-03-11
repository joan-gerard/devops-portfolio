import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/test-utils";
import { ProjectCard } from "./ProjectCard";
import type { PublishedProject } from "@/lib/queries/project";

function makeProject(overrides: Partial<PublishedProject> = {}): PublishedProject {
  return {
    id: "1",
    title: "Test Project",
    slug: "test-project",
    description: "A short description.",
    tech_stack: [],
    github_url: null,
    live_url: null,
    ...overrides,
  };
}

describe("ProjectCard", () => {
  it("renders title and description correctly", () => {
    const project = makeProject({
      title: "My App",
      description: "An app that does things.",
    });
    render(<ProjectCard project={project} />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("My App");
    expect(screen.getByText("An app that does things.")).toBeInTheDocument();
  });

  it("renders title when description is missing", () => {
    const project = makeProject({ description: undefined });
    render(<ProjectCard project={project} />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Test Project");
    expect(screen.queryByText("A short description.")).not.toBeInTheDocument();
  });

  it("renders tech stack tags when present", () => {
    const project = makeProject({
      tech_stack: ["React", "TypeScript", "Next.js"],
    });
    render(<ProjectCard project={project} />);

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.getByText("TypeScript")).toBeInTheDocument();
    expect(screen.getByText("Next.js")).toBeInTheDocument();
  });

  it("hides tag container when tech_stack is empty", () => {
    const project = makeProject({ tech_stack: [] });
    const { container } = render(<ProjectCard project={project} />);

    const tagSpans = container.querySelectorAll("span");
    expect(tagSpans).toHaveLength(0);
  });

  it("renders GitHub link only when github_url exists, with correct href, target, rel, and aria-label", () => {
    const project = makeProject({
      title: "Cool Project",
      github_url: "https://github.com/user/cool-project",
    });
    render(<ProjectCard project={project} />);

    const githubLink = screen.getByRole("link", {
      name: /github repository for cool project/i,
    });
    expect(githubLink).toBeInTheDocument();
    expect(githubLink).toHaveAttribute("href", "https://github.com/user/cool-project");
    expect(githubLink).toHaveAttribute("target", "_blank");
    expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not render GitHub link when github_url is null or empty", () => {
    render(<ProjectCard project={makeProject({ github_url: null })} />);
    expect(screen.queryByRole("link", { name: /github repository/i })).not.toBeInTheDocument();

    render(<ProjectCard project={makeProject({ github_url: "" })} />);
    expect(screen.queryByRole("link", { name: /github repository/i })).not.toBeInTheDocument();
  });

  it("renders Live link only when live_url exists, with correct href, target, rel, and aria-label", () => {
    const project = makeProject({
      title: "Demo App",
      live_url: "https://demo.example.com",
    });
    render(<ProjectCard project={project} />);

    const liveLink = screen.getByRole("link", {
      name: /live demo for demo app/i,
    });
    expect(liveLink).toBeInTheDocument();
    expect(liveLink).toHaveAttribute("href", "https://demo.example.com");
    expect(liveLink).toHaveAttribute("target", "_blank");
    expect(liveLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not render Live link when live_url is null or empty", () => {
    render(<ProjectCard project={makeProject({ live_url: null })} />);
    expect(screen.queryByRole("link", { name: /live demo/i })).not.toBeInTheDocument();

    render(<ProjectCard project={makeProject({ live_url: "" })} />);
    expect(screen.queryByRole("link", { name: /live demo/i })).not.toBeInTheDocument();
  });

  it("renders Details link with correct href and aria-label", () => {
    const project = makeProject({
      title: "Some Project",
      slug: "some-project",
    });
    render(<ProjectCard project={project} />);

    const detailsLink = screen.getByRole("link", {
      name: /details for some project/i,
    });
    expect(detailsLink).toBeInTheDocument();
    expect(detailsLink).toHaveAttribute("href", "/projects/some-project");
  });

  it("renders all links when project has github_url, live_url, and Details", () => {
    const project = makeProject({
      title: "Full Project",
      slug: "full-project",
      github_url: "https://github.com/org/full",
      live_url: "https://full.example.com",
    });
    render(<ProjectCard project={project} />);

    expect(
      screen.getByRole("link", { name: /github repository for full project/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /live demo for full project/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /details for full project/i })).toHaveAttribute(
      "href",
      "/projects/full-project"
    );
  });
});
