"use client";

import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

interface AuthSessionProviderProps {
  children: React.ReactNode;
  session: Session | null;
}

/**
 * Client-only wrapper for next-auth SessionProvider.
 * Required because SessionProvider uses React Context, which is not available in Server Components.
 * The parent layout fetches the session on the server and passes it here.
 */
export function AuthSessionProvider({ children, session }: AuthSessionProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
