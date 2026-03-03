import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/editor/:path*",
    "/admin/roadmap/:path*",
    "/admin/notes/:path*",
    "/admin/projects/:path*",
  ],
};
