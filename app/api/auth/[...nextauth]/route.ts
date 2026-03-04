import bcrypt from "bcryptjs";
import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { AUTH_ERROR_SERVICE_UNAVAILABLE } from "@/lib/auth";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const hash = process.env.ADMIN_PASSWORD_HASH;
        if (!hash || hash.trim() === "") {
          console.error("[Auth] ADMIN_PASSWORD_HASH is not set or empty; sign-in rejected.");
          throw new Error(AUTH_ERROR_SERVICE_UNAVAILABLE);
        }

        const isValidEmail = credentials.email === process.env.ADMIN_EMAIL;
        let isValidPassword = false;
        try {
          isValidPassword = await bcrypt.compare(credentials.password, hash);
        } catch (err) {
          console.error(
            "[Auth] Password hash comparison failed:",
            err instanceof Error ? err.message : err
          );
          throw new Error(AUTH_ERROR_SERVICE_UNAVAILABLE);
        }

        if (!isValidEmail || !isValidPassword) return null;

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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
