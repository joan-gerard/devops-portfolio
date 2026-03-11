import { vi } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import { ProjectSlugField } from "./ProjectSlugField";
import { slugify } from "@/lib/slugify";

vi.mock("@/lib/slugify", () => ({
  slugify: vi.fn((value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 80)
  ),
}));

const mockedSlugify = vi.mocked(slugify);

describe("ProjectSlugField", () => {
  const onChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderField(
    props: { value?: string; titleForRegenerate?: string; published?: boolean } = {}
  ) {
    const { value = "", titleForRegenerate = "", published = false } = props;
    render(
      <ProjectSlugField
        value={value}
        onChange={onChange}
        titleForRegenerate={titleForRegenerate}
        published={published}
      />
    );
    return screen.getByRole("textbox", { name: /project url slug/i });
  }

  describe("slug input sanitization", () => {
    it("lowercases typed input", () => {
      const input = renderField();
      fireEvent.change(input, { target: { value: "My-Project" } });
      expect(onChange).toHaveBeenCalledWith("my-project");
    });

    it("replaces disallowed characters with hyphens (spaces and special chars)", () => {
      const input = renderField();
      fireEvent.change(input, { target: { value: "my project! 2024" } });
      expect(onChange).toHaveBeenCalledWith("my-project-2024");
    });

    it("collapses multiple hyphens into one", () => {
      const input = renderField();
      fireEvent.change(input, { target: { value: "a--b---c" } });
      expect(onChange).toHaveBeenCalledWith("a-b-c");
    });

    it("allows only lowercase letters, digits, and hyphens", () => {
      const input = renderField();
      fireEvent.change(input, { target: { value: "valid-slug-99" } });
      expect(onChange).toHaveBeenCalledWith("valid-slug-99");
    });
  });

  describe("Regenerate from title button", () => {
    it("calls onChange with slugify(titleForRegenerate) when clicked", () => {
      mockedSlugify.mockReturnValue("untitled-project");
      renderField({ value: "old-slug", titleForRegenerate: "Untitled Project" });

      fireEvent.click(screen.getByRole("button", { name: /from title/i }));

      expect(mockedSlugify).toHaveBeenCalledWith("Untitled Project");
      expect(onChange).toHaveBeenCalledWith("untitled-project");
    });

    it("regenerate result respects slugify length limit (e.g. 80 chars)", () => {
      const longTitle = "a".repeat(100);
      renderField({ titleForRegenerate: longTitle });

      fireEvent.click(screen.getByRole("button", { name: /from title/i }));

      const slugPassedToOnChange = onChange.mock.calls[0]?.[0] ?? "";
      expect(slugPassedToOnChange.length).toBeLessThanOrEqual(80);
      expect(mockedSlugify).toHaveBeenCalledWith(longTitle);
    });

    it("button has accessible title for regeneration", () => {
      renderField({ titleForRegenerate: "My Project" });
      expect(screen.getByRole("button", { name: /from title/i })).toHaveAttribute(
        "title",
        "Regenerate from title"
      );
    });
  });

  describe("published hint", () => {
    it("shows warning hint when published is true", () => {
      renderField({ value: "my-project", published: true });
      expect(
        screen.getByText(/changing the slug of a published project will break existing urls/i)
      ).toBeInTheDocument();
    });

    it("does not show warning hint when published is false", () => {
      renderField({ value: "my-project", published: false });
      expect(
        screen.queryByText(/changing the slug of a published project will break existing urls/i)
      ).not.toBeInTheDocument();
    });
  });
});
