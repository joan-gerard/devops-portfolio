"use client";

import {
  LoginError,
  LoginFormField,
  LoginFormHeader,
  LoginLayout,
  LoginSubmitButton,
} from "@/components/auth";
import { submitLogin } from "@/lib/submitLogin";
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

    try {
      const result = await submitLogin(email, password);
      if (result.ok) {
        router.push("/admin/dashboard");
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
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
