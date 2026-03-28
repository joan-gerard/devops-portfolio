import { fireEvent, render, screen } from "@/test/test-utils";
import { vi } from "vitest";

import { AdminShell } from "./AdminShell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/dashboard",
}));

describe("AdminShell", () => {
  it("renders sidebar toggle with aria-expanded and aria-controls when sidebar is open", () => {
    render(
      <AdminShell appVersion="1.0.0">
        <p>child</p>
      </AdminShell>
    );

    const toggle = screen.getByRole("button", { name: /collapse navigation sidebar/i });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAttribute("aria-controls", "admin-sidebar");
    expect(document.getElementById("admin-sidebar")).not.toHaveAttribute("inert");
  });

  it("collapses sidebar when toggle is clicked", () => {
    render(
      <AdminShell appVersion="1.0.0">
        <p>child</p>
      </AdminShell>
    );

    fireEvent.click(screen.getByRole("button", { name: /collapse navigation sidebar/i }));

    expect(screen.getByRole("button", { name: /expand navigation sidebar/i })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
    expect(document.getElementById("admin-sidebar")).toHaveAttribute("inert");
  });

  it("expands sidebar when toggle is clicked again", () => {
    render(
      <AdminShell appVersion="1.0.0">
        <p>child</p>
      </AdminShell>
    );

    fireEvent.click(screen.getByRole("button", { name: /collapse navigation sidebar/i }));
    fireEvent.click(screen.getByRole("button", { name: /expand navigation sidebar/i }));

    expect(screen.getByRole("button", { name: /collapse navigation sidebar/i })).toHaveAttribute(
      "aria-expanded",
      "true"
    );
    expect(document.getElementById("admin-sidebar")).not.toHaveAttribute("inert");
  });
});
