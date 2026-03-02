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
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const isValidEmail = credentials.email === process.env.ADMIN_EMAIL;
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          process.env.ADMIN_PASSWORD_HASH!
        );

        if (!isValidEmail || !isValidPassword) return null;

        return { id: "1", email: credentials.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
