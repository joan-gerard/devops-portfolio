import { vi } from "vitest";
import { render, screen, fireEvent } from "@/test/test-utils";
import { EditMetaBar } from "./EditMetaBar";
import Link from "next/link";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

const defaultProps = {
  backHref: "/admin/notes",
  backLabel: "← Notes",
  onTogglePublished: vi.fn(),
  deleteAction: <span data-testid="delete-action">Delete</span>,
};

describe("EditMetaBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("save status display", () => {
    it("does not show status label when saveStatus is idle", () => {
      render(
        <EditMetaBar
          {...defaultProps}
          saveStatus="idle"
          statusColor="var(--text-muted)"
          statusLabel=""
          published={false}
        />
      );
      expect(screen.queryByText("Saving…")).not.toBeInTheDocument();
      expect(screen.queryByText("Saved")).not.toBeInTheDocument();
      expect(screen.queryByText("Save failed")).not.toBeInTheDocument();
    });

    it("shows Saving… with statusColor when saveStatus is saving", () => {
      render(
        <EditMetaBar
          {...defaultProps}
          saveStatus="saving"
          statusColor="var(--yellow)"
          statusLabel="Saving…"
          published={false}
        />
      );
      const label = screen.getByText("Saving…");
      expect(label).toBeInTheDocument();
      expect(label).toHaveStyle({ color: "var(--yellow)" });
    });

    it("shows Saved with statusColor when saveStatus is saved", () => {
      render(
        <EditMetaBar
          {...defaultProps}
          saveStatus="saved"
          statusColor="var(--accent)"
          statusLabel="Saved"
          published={false}
        />
      );
      const label = screen.getByText("Saved");
      expect(label).toBeInTheDocument();
      expect(label).toHaveStyle({ color: "var(--accent)" });
    });

    it("shows Save failed with statusColor when saveStatus is error", () => {
      render(
        <EditMetaBar
          {...defaultProps}
          saveStatus="error"
          statusColor="var(--red)"
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
        <EditMetaBar
          {...defaultProps}
          saveStatus="idle"
          statusColor="var(--text-muted)"
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
        <EditMetaBar
          {...defaultProps}
          saveStatus="idle"
          statusColor="var(--text-muted)"
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
    it("renders back link with backHref and backLabel (notes)", () => {
      render(
        <EditMetaBar
          {...defaultProps}
          backHref="/admin/notes"
          backLabel="← Notes"
          saveStatus="idle"
          statusColor="var(--text-muted)"
          statusLabel=""
          published={false}
        />
      );
      const link = screen.getByRole("link", { name: /← notes/i });
      expect(link).toHaveAttribute("href", "/admin/notes");
    });

    it("renders back link with backHref and backLabel (projects)", () => {
      render(
        <EditMetaBar
          {...defaultProps}
          backHref="/admin/projects"
          backLabel="← Projects"
          saveStatus="idle"
          statusColor="var(--text-muted)"
          statusLabel=""
          published={false}
        />
      );
      const link = screen.getByRole("link", { name: /← projects/i });
      expect(link).toHaveAttribute("href", "/admin/projects");
    });
  });

  describe("delete action", () => {
    it("renders deleteAction slot", () => {
      render(
        <EditMetaBar
          {...defaultProps}
          saveStatus="idle"
          statusColor="var(--text-muted)"
          statusLabel=""
          published={false}
        />
      );
      expect(screen.getByTestId("delete-action")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
  });

  describe("secondary action", () => {
    it("renders secondaryAction slot when provided", () => {
      render(
        <EditMetaBar
          {...defaultProps}
          saveStatus="idle"
          statusColor="var(--text-muted)"
          statusLabel=""
          published={false}
          secondaryAction={
            <Link href="/admin/notes/preview/sample" data-testid="preview-action">
              Preview
            </Link>
          }
        />
      );
      const previewLink = screen.getByTestId("preview-action");
      expect(previewLink).toBeInTheDocument();
      expect(previewLink).toHaveAttribute("href", "/admin/notes/preview/sample");
    });
  });
});
