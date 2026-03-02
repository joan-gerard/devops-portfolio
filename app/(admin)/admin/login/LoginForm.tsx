"use client";

import {
  LoginError,
  LoginFormField,
  LoginFormHeader,
  LoginLayout,
  LoginSubmitButton,
} from "@/components/auth";
import { AUTH_ERROR_SERVICE_UNAVAILABLE } from "@/lib/auth";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const formStyle = { width: "100%", maxWidth: "360px", padding: "0 24px" } as const;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(
        result.error === AUTH_ERROR_SERVICE_UNAVAILABLE
          ? "Sign-in is temporarily unavailable. Please try again later."
          : "Invalid email or password"
      );
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <LoginLayout>
      <form onSubmit={handleSubmit} style={formStyle}>
        <LoginFormHeader />
        {error && <LoginError message={error} />}
        <LoginFormField
          id="login-email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          marginBottom="16px"
        />
        <LoginFormField
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          marginBottom="24px"
        />
        <LoginSubmitButton loading={loading} />
      </form>
    </LoginLayout>
  );
}
