export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/guest/:path*"],
};
