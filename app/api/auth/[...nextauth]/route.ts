/**
 * NextAuth.js catch-all route and configuration.
 *
 * Handles GET/POST for all NextAuth endpoints (signin, signout, session, etc.)
 * using a credentials provider with a single admin identity (ADMIN_EMAIL +
 * ADMIN_PASSWORD_HASH). Login attempts are rate-limited by IP; JWT session strategy
 * is used with no database session store.
 *
 * @see docs/authentication.md
 */

import { checkRateLimit, clearRateLimit } from "@/lib/queries/loginAttempts";
import bcrypt from "bcryptjs";
import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * NextAuth options: credentials provider, JWT session, custom sign-in page,
 * and callbacks that attach role to token/session. Exported for use with
 * getServerSession(authOptions) in API routes and Server Components.
 */
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        // Extract IP — x-forwarded-for is set by Vercel in production
        // Fall back to x-real-ip, then socket address, then undefined
        const forwarded = req.headers?.["x-forwarded-for"];
        const ip =
          (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0])?.trim() ||
          (req.headers?.["x-real-ip"] as string | undefined)?.trim() ||
          undefined;

        // Check rate limit
        const { allowed, minutesLeft } = await checkRateLimit(ip);
        if (!allowed) {
          throw new Error(
            `Too many login attempts. Please try again in ${minutesLeft} minute${minutesLeft === 1 ? "" : "s"}.`
          );
        }
        // Validate credentials
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const isValidEmail = credentials.email === process.env.ADMIN_EMAIL;
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          process.env.ADMIN_PASSWORD_HASH ?? ""
        );

        if (!isValidEmail || !isValidPassword) {
          throw new Error("Invalid email or password");
        }

        // Clear rate limit counter on successful login
        await clearRateLimit(ip);

        return { id: "1", email: credentials.email, role: "admin" };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user?.role) token.role = user.role;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
};

/**
 * NextAuth request handler. Handles GET and POST for /api/auth/* (e.g. signin,
 * signout, session, csrf, providers). Used by the App Router as the catch-all
 * for the [...nextauth] segment.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
