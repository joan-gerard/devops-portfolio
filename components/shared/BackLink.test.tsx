import { render, screen } from "@/test/test-utils";
import { BackLink } from "./BackLink";

describe("BackLink", () => {
  it("renders a link with href and children", () => {
    render(<BackLink href="/notes">← All notes</BackLink>);
    const link = screen.getByRole("link", { name: /← all notes/i });
    expect(link).toHaveAttribute("href", "/notes");
    expect(link).toHaveClass("back-link");
  });

  it("appends optional className for context-specific overrides", () => {
    render(
      <BackLink href="/admin/notes" className="back-link--compact">
        ← Notes
      </BackLink>
    );
    const link = screen.getByRole("link", { name: /← notes/i });
    expect(link).toHaveClass("back-link", "back-link--compact");
  });
});
