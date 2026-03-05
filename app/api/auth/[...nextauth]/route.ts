import { checkRateLimit, clearRateLimit } from "@/lib/queries/loginAttempts";
import bcrypt from "bcryptjs";
import NextAuth, { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

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
        const forwarded = req.headers?.["x-forwarded-for"];
        const ip =
          (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0]) ?? "unknown";

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

        return { id: "1", email: credentials.email };
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
