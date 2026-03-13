import { render, screen } from "@/test/test-utils";
import { RecentNotesSection } from "./RecentNotesSection";
import type { RecentNote } from "@/types/home";

const mockNote: RecentNote = {
  id: "note-1",
  title: "A Recent Note",
  slug: "a-recent-note",
  tags: ["devops"],
  updated_at: "2024-06-01T12:00:00Z",
};

describe("RecentNotesSection", () => {
  it("shows correct section label and heading", () => {
    render(<RecentNotesSection notes={[]} />);
    expect(screen.getByText("Recent Notes")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("What I've been writing");
  });

  it("shows empty message when notes list is empty", () => {
    render(<RecentNotesSection notes={[]} />);
    expect(screen.getByText("No notes published yet.")).toBeInTheDocument();
  });

  it("renders the right number of note cards when data is present", () => {
    const notes: RecentNote[] = [
      mockNote,
      { ...mockNote, id: "note-2", title: "Another Note", slug: "another-note" },
    ];
    render(<RecentNotesSection notes={notes} />);
    expect(screen.getByText("A Recent Note")).toBeInTheDocument();
    expect(screen.getByText("Another Note")).toBeInTheDocument();
    expect(screen.queryByText("No notes published yet.")).not.toBeInTheDocument();
  });

  it("shows All notes link to /notes", () => {
    render(<RecentNotesSection notes={[]} />);
    const link = screen.getByRole("link", { name: /all notes/i });
    expect(link).toHaveAttribute("href", "/notes");
  });
});
