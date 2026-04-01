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

  it("supports custom back link for preview context", () => {
    render(
      <NoteDetail
        note={{ ...mockNote, content: undefined }}
        backHref="/admin/editor/note-1"
        backLabel="← Editor"
      />
    );
    const link = screen.getByRole("link", { name: /← editor/i });
    expect(link).toHaveAttribute("href", "/admin/editor/note-1");
  });

  it("shows empty content message when note has no content", () => {
    render(<NoteDetail note={{ ...mockNote, content: undefined }} />);
    expect(screen.getByText("No content yet.")).toBeInTheDocument();
  });

  it("renders table of contents links for heading content", () => {
    render(
      <NoteDetail
        note={{
          ...mockNote,
          content: {
            type: "doc",
            content: [
              {
                type: "heading",
                attrs: { level: 2 },
                content: [{ type: "text", text: "Overview" }],
              },
              {
                type: "paragraph",
                content: [{ type: "text", text: "Some content" }],
              },
              {
                type: "heading",
                attrs: { level: 3 },
                content: [{ type: "text", text: "Overview" }],
              },
              {
                type: "heading",
                attrs: { level: 4 },
                content: [{ type: "text", text: "Deep dive" }],
              },
            ],
          },
        }}
      />
    );

    const toc = screen.getByRole("navigation", { name: /table of contents/i });
    expect(toc).toBeInTheDocument();

    const links = screen.getAllByRole("link", { name: "Overview" });
    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(links[0]).toHaveAttribute("href", "#overview");
    expect(links[1]).toHaveAttribute("href", "#overview-2");
    expect(screen.getByRole("link", { name: "Deep dive" })).toHaveAttribute("href", "#deep-dive");
  });
});
