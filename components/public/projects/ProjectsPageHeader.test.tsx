import { render, screen } from "@/test/test-utils";
import { ProjectsPageHeader } from "./ProjectsPageHeader";

describe("ProjectsPageHeader", () => {
  it("shows the Projects label", () => {
    render(<ProjectsPageHeader />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("shows the correct heading", () => {
    render(<ProjectsPageHeader />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What I've been building");
  });

  it("shows the page description", () => {
    render(<ProjectsPageHeader />);
    expect(screen.getByText(/Real projects built while learning DevOps/)).toBeInTheDocument();
  });
});
