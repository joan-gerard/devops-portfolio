import { render, screen } from "@/test/test-utils";
import { NotesEmptyState } from "./NotesEmptyState";

describe("NotesEmptyState", () => {
  it("shows generic empty message when no tag is active", () => {
    render(<NotesEmptyState activeTag={null} />);
    expect(screen.getByText("No notes published yet — check back soon.")).toBeInTheDocument();
  });

  it("shows tag-specific empty message when a tag is active", () => {
    render(<NotesEmptyState activeTag="devops" />);
    expect(screen.getByText('No notes tagged "devops".')).toBeInTheDocument();
  });
});
