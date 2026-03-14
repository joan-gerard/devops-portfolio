import { render, screen } from "@/test/test-utils";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders message when provided", () => {
    render(<EmptyState message="No items yet." />);
    expect(screen.getByText("No items yet.")).toBeInTheDocument();
  });

  it("renders children when provided", () => {
    render(
      <EmptyState>
        <p>Custom empty content</p>
      </EmptyState>
    );
    expect(screen.getByText("Custom empty content")).toBeInTheDocument();
  });

  it("renders both message and children when both provided", () => {
    render(
      <EmptyState message="No results.">
        <p>Try another filter.</p>
      </EmptyState>
    );
    expect(screen.getByText("No results.")).toBeInTheDocument();
    expect(screen.getByText("Try another filter.")).toBeInTheDocument();
  });

  it("applies optional style override to wrapper", () => {
    const { container } = render(<EmptyState message="Empty" style={{ padding: "48px 0" }} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveStyle({ padding: "48px 0px" });
  });
});
