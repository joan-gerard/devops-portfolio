import { fireEvent, render, screen } from "@/test/test-utils";
import { BackToTopButton } from "./BackToTopButton";

describe("BackToTopButton", () => {
  it("shows the floating button after scrolling past the threshold", () => {
    const { container } = render(<BackToTopButton />);
    const button = container.querySelector(".back-to-top-btn");
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveClass("back-to-top-btn--visible");

    Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 400 });
    fireEvent.scroll(window);

    expect(button).toHaveClass("back-to-top-btn--visible");
  });

  it("scrolls to top when clicked", () => {
    const scrollToSpy = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<BackToTopButton />);

    Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 400 });
    fireEvent.scroll(window);
    fireEvent.click(screen.getByRole("button", { name: /top/i }));

    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
    scrollToSpy.mockRestore();
  });
});
