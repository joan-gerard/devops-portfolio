import { vi, type Mock } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "./LoginForm";
import * as submitLoginModule from "@/lib/submitLogin";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/lib/submitLogin");

const mockedSubmitLogin = submitLoginModule.submitLogin as unknown as Mock;

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function fillAndSubmit(email: string, password: string) {
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: email },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: password },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
  }

  it("submits with valid credentials and redirects on success", async () => {
    mockedSubmitLogin.mockResolvedValue({ ok: true });

    render(<LoginForm />);

    fillAndSubmit("user@example.com", "password123");

    await waitFor(() => {
      expect(mockedSubmitLogin).toHaveBeenCalledWith("user@example.com", "password123");
      expect(pushMock).toHaveBeenCalledWith("/admin/dashboard");
    });
  });

  it("shows error message when submitLogin returns error", async () => {
    mockedSubmitLogin.mockResolvedValue({ ok: false, error: "Invalid credentials" });

    render(<LoginForm />);

    fillAndSubmit("user@example.com", "wrong-password");

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("shows fallback error message when submitLogin throws", async () => {
    mockedSubmitLogin.mockRejectedValue(new Error("Network error"));

    render(<LoginForm />);

    fillAndSubmit("user@example.com", "password123");

    expect(await screen.findByText("Network error")).toBeInTheDocument();
  });
});
