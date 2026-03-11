import { render, screen } from "@/test/test-utils";
import { NotesPageHeader } from "./NotesPageHeader";

describe("NotesPageHeader", () => {
  it("shows the Notes label", () => {
    render(<NotesPageHeader />);
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("shows the correct heading", () => {
    render(<NotesPageHeader />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("What I've been learning");
  });

  it("shows the page description", () => {
    render(<NotesPageHeader />);
    expect(
      screen.getByText(/Notes written while working through my DevOps course/)
    ).toBeInTheDocument();
  });
});
