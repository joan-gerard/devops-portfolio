import { render, screen } from "@/test/test-utils";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders label, heading, and description", () => {
    render(
      <PageHeader
        label="Section"
        heading="Main title"
        description="A short description of the page."
      />
    );
    expect(screen.getByText("Section")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Main title");
    expect(screen.getByText("A short description of the page.")).toBeInTheDocument();
  });

  it("renders notes page header content when given notes copy", () => {
    render(
      <PageHeader
        label="Notes"
        heading="What I've been learning"
        description="Notes written while working through my DevOps course — covering infrastructure, security, tooling, and everything in between."
      />
    );
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What I've been learning");
    expect(
      screen.getByText(/Notes written while working through my DevOps course/)
    ).toBeInTheDocument();
  });

  it("renders projects page header content when given projects copy", () => {
    render(
      <PageHeader
        label="Projects"
        heading="What I've been building"
        description="Real projects built while learning DevOps — each one documented from infrastructure decisions to deployment."
      />
    );
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What I've been building");
    expect(screen.getByText(/Real projects built while learning DevOps/)).toBeInTheDocument();
  });
});
