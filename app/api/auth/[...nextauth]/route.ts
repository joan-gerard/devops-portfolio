import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("ENV EMAIL:", process.env.ADMIN_EMAIL);
        console.log("ENV HASH:", process.env.ADMIN_PASSWORD_HASH);
        console.log("SUBMITTED EMAIL:", credentials?.email);

        if (!credentials?.email || !credentials?.password) return null;

        const isValidEmail = credentials.email === process.env.ADMIN_EMAIL;
        console.log("EMAIL MATCH:", isValidEmail);
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          process.env.ADMIN_PASSWORD_HASH!
        );
        console.log("PASSWORD:", credentials.password);
        console.log("PASSWORD MATCH:", isValidPassword);

        if (!isValidEmail || !isValidPassword) return null;

        return { id: "1", email: credentials.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
});

export { handler as GET, handler as POST };
