import "next-auth";
import "next-auth/jwt";
import type { DefaultSession } from "next-auth";

/**
 * Augments NextAuth so the session user includes a role.
 * Role is set in authorize() and propagated via jwt/session callbacks.
 */
declare module "next-auth" {
  interface User {
    role?: string;
  }

  interface Session {
    user: DefaultSession["user"] & { role?: string };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
  }
}
