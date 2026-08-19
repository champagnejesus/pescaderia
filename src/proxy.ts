export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|~offline|sw.js|manifest.json|icons).*)"],
};
