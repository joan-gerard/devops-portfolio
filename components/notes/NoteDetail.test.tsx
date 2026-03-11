import { render, screen } from "@/test/test-utils";
import { NoteDetail } from "./NoteDetail";
import type { PublicNote } from "@/types/pages";

const mockNote: PublicNote = {
  id: "note-1",
  title: "My Test Note",
  slug: "my-test-note",
  tags: ["devops", "testing"],
  updated_at: "2024-06-15T10:00:00Z",
};

describe("NoteDetail", () => {
  it("shows the note title", () => {
    render(<NoteDetail note={{ ...mockNote, content: undefined }} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("My Test Note");
  });

  it("shows the Note label in the header", () => {
    render(<NoteDetail note={{ ...mockNote, content: undefined }} />);
    expect(screen.getByText("Note")).toBeInTheDocument();
  });

  it("shows all tags", () => {
    render(<NoteDetail note={{ ...mockNote, content: undefined }} />);
    expect(screen.getByText("devops")).toBeInTheDocument();
    expect(screen.getByText("testing")).toBeInTheDocument();
  });

  it("shows formatted updated date", () => {
    render(<NoteDetail note={{ ...mockNote, content: undefined }} />);
    expect(screen.getByText("15 Jun 2024")).toBeInTheDocument();
  });

  it("shows back link to /notes", () => {
    render(<NoteDetail note={{ ...mockNote, content: undefined }} />);
    const link = screen.getByRole("link", { name: /← all notes/i });
    expect(link).toHaveAttribute("href", "/notes");
  });

  it("shows empty content message when note has no content", () => {
    render(<NoteDetail note={{ ...mockNote, content: undefined }} />);
    expect(screen.getByText("No content yet.")).toBeInTheDocument();
  });
});
