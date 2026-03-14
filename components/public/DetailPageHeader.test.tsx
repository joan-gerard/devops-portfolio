import { render, screen } from "@/test/test-utils";
import { DetailPageHeader } from "./DetailPageHeader";

describe("DetailPageHeader", () => {
  it("renders label and title", () => {
    render(<DetailPageHeader label="Note" title="My note title" />);
    expect(screen.getByText("Note")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("My note title");
  });

  it("renders optional metadata when provided", () => {
    render(
      <DetailPageHeader
        label="Project"
        title="My project"
        metadata={<p>Last updated 15 Jun 2024</p>}
      />
    );
    expect(screen.getByText("Last updated 15 Jun 2024")).toBeInTheDocument();
  });

  it("does not render metadata container when metadata is omitted", () => {
    const { container } = render(<DetailPageHeader label="Note" title="Title" />);
    const header = container.firstElementChild;
    expect(header?.childNodes.length).toBe(2); // label p and h1 only
  });
});
