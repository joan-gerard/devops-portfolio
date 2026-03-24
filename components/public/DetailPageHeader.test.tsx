import { render, screen } from "@/test/test-utils";
import { DetailPageHeader } from "./DetailPageHeader";

describe("DetailPageHeader", () => {
  it("renders label, bullet, date, title, and optional tag chips", () => {
    render(
      <DetailPageHeader
        label="Note"
        title="My note title"
        tags={["devops"]}
        updatedAt="15 Jun 2024"
      />
    );
    expect(screen.getByText("Note")).toBeInTheDocument();
    expect(screen.getByText("•")).toBeInTheDocument();
    expect(screen.getByText("15 Jun 2024")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("My note title");
    expect(screen.getByText("devops")).toBeInTheDocument();
  });

  it("renders project-style header with tags when provided", () => {
    render(
      <DetailPageHeader
        label="Project"
        title="My project"
        tags={["learning"]}
        updatedAt="15 Jun 2024"
      />
    );
    expect(screen.getByText("Project")).toBeInTheDocument();
    expect(screen.queryByText(/Last updated/)).not.toBeInTheDocument();
    expect(screen.getByText("15 Jun 2024")).toBeInTheDocument();
    expect(screen.getByText("learning")).toBeInTheDocument();
  });

  it("renders with empty tags (no chips)", () => {
    const { container } = render(
      <DetailPageHeader label="Note" title="Title" tags={[]} updatedAt="15 Jun 2024" />
    );
    const header = container.firstElementChild;
    expect(header?.childNodes.length).toBe(3);
    expect(screen.queryByText("devops")).not.toBeInTheDocument();
  });
});
