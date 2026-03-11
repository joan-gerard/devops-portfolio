import { vi } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import { ProjectEditMetaBar } from "./ProjectEditMetaBar";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const defaultProps = {
  projectId: "project-1",
  onTogglePublished: vi.fn(),
};

describe("ProjectEditMetaBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("save status display", () => {
    it("does not show status label when saveStatus is idle", () => {
      render(
        <ProjectEditMetaBar
          {...defaultProps}
          saveStatus="idle"
          statusColour="var(--text-muted)"
          statusLabel=""
          published={false}
        />
      );
      expect(screen.queryByText("Saving…")).not.toBeInTheDocument();
      expect(screen.queryByText("Saved")).not.toBeInTheDocument();
      expect(screen.queryByText("Save failed")).not.toBeInTheDocument();
    });

    it("shows Saving… with statusColour when saveStatus is saving", () => {
      render(
        <ProjectEditMetaBar
          {...defaultProps}
          saveStatus="saving"
          statusColour="var(--yellow)"
          statusLabel="Saving…"
          published={false}
        />
      );
      const label = screen.getByText("Saving…");
      expect(label).toBeInTheDocument();
      expect(label).toHaveStyle({ color: "var(--yellow)" });
    });

    it("shows Saved with statusColour when saveStatus is saved", () => {
      render(
        <ProjectEditMetaBar
          {...defaultProps}
          saveStatus="saved"
          statusColour="var(--accent)"
          statusLabel="Saved"
          published={false}
        />
      );
      const label = screen.getByText("Saved");
      expect(label).toBeInTheDocument();
      expect(label).toHaveStyle({ color: "var(--accent)" });
    });

    it("shows Save failed with statusColour when saveStatus is error", () => {
      render(
        <ProjectEditMetaBar
          {...defaultProps}
          saveStatus="error"
          statusColour="var(--red)"
          statusLabel="Save failed"
          published={false}
        />
      );
      const label = screen.getByText("Save failed");
      expect(label).toBeInTheDocument();
      expect(label).toHaveStyle({ color: "var(--red)" });
    });
  });

  describe("publish toggle", () => {
    it("shows Publish button when not published and calls onTogglePublished on click", () => {
      render(
        <ProjectEditMetaBar
          {...defaultProps}
          saveStatus="idle"
          statusColour="var(--text-muted)"
          statusLabel=""
          published={false}
        />
      );
      const button = screen.getByRole("button", { name: /^publish$/i });
      fireEvent.click(button);
      expect(defaultProps.onTogglePublished).toHaveBeenCalledTimes(1);
    });

    it("shows Published button when published and calls onTogglePublished on click", () => {
      render(
        <ProjectEditMetaBar
          {...defaultProps}
          saveStatus="idle"
          statusColour="var(--text-muted)"
          statusLabel=""
          published={true}
        />
      );
      const button = screen.getByRole("button", { name: /^published$/i });
      fireEvent.click(button);
      expect(defaultProps.onTogglePublished).toHaveBeenCalledTimes(1);
    });
  });

  describe("back link", () => {
    it("renders back link to /admin/projects", () => {
      render(
        <ProjectEditMetaBar
          {...defaultProps}
          saveStatus="idle"
          statusColour="var(--text-muted)"
          statusLabel=""
          published={false}
        />
      );
      const link = screen.getByRole("link", { name: /← projects/i });
      expect(link).toHaveAttribute("href", "/admin/projects");
    });
  });
});
