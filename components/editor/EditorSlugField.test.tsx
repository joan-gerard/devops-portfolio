import { vi } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import { EditorSlugField } from "./EditorSlugField";

describe("EditorSlugField", () => {
  const onChange = vi.fn();
  const onRegenerateFromTitle = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderField(props: { value?: string; published?: boolean } = {}) {
    const { value = "", published = false } = props;
    render(
      <EditorSlugField
        value={value}
        onChange={onChange}
        onRegenerateFromTitle={onRegenerateFromTitle}
        published={published}
      />
    );
    return screen.getByRole("textbox", { name: /note url slug/i });
  }

  describe("slug input sanitization", () => {
    it("lowercases typed input", () => {
      const input = renderField();
      fireEvent.change(input, { target: { value: "My-Note" } });
      expect(onChange).toHaveBeenCalledWith("my-note");
    });

    it("replaces disallowed characters with hyphens (spaces and special chars)", () => {
      const input = renderField();
      fireEvent.change(input, { target: { value: "my note! 123" } });
      expect(onChange).toHaveBeenCalledWith("my-note-123");
    });

    it("collapses multiple hyphens into one", () => {
      const input = renderField();
      fireEvent.change(input, { target: { value: "a--b---c" } });
      expect(onChange).toHaveBeenCalledWith("a-b-c");
    });

    it("allows only lowercase letters, digits, and hyphens", () => {
      const input = renderField();
      fireEvent.change(input, { target: { value: "valid-slug-123" } });
      expect(onChange).toHaveBeenCalledWith("valid-slug-123");
    });
  });

  describe("Regenerate from title button", () => {
    it("calls onRegenerateFromTitle when the button is clicked", () => {
      renderField();
      fireEvent.click(screen.getByRole("button", { name: /from title/i }));
      expect(onRegenerateFromTitle).toHaveBeenCalledTimes(1);
    });

    it("button has accessible title for regeneration", () => {
      renderField();
      expect(screen.getByRole("button", { name: /from title/i })).toHaveAttribute(
        "title",
        "Regenerate from title"
      );
    });
  });

  describe("published hint", () => {
    it("shows warning hint when published is true", () => {
      renderField({ value: "my-note", published: true });
      expect(
        screen.getByText(/changing the slug of a published note will break existing urls/i)
      ).toBeInTheDocument();
    });

    it("does not show warning hint when published is false", () => {
      renderField({ value: "my-note", published: false });
      expect(
        screen.queryByText(/changing the slug of a published note will break existing urls/i)
      ).not.toBeInTheDocument();
    });
  });
});
