import nextAuthMiddleware from "next-auth/middleware";

export function proxy(...args: Parameters<typeof nextAuthMiddleware>) {
  return nextAuthMiddleware(...args);
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/editor/:path*", "/admin/roadmap/:path*"],
};
