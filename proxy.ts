import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export default withAuth(
  function proxy(req: NextRequest) {
    if (req.nextUrl.pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
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
    "/admin",
    "/admin/dashboard/:path*",
    "/admin/editor/:path*",
    "/admin/roadmap/:path*",
    "/admin/notes/:path*",
    "/admin/projects/:path*",
  ],
};
