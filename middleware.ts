import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const isAuthenticated = !!token

  // Get the pathname of the request
  const path = req.nextUrl.pathname

  // Allow access to auth-related pages for non-authenticated users
  if (!isAuthenticated && (path.startsWith("/dashboard") || path === "/")) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && (path === "/login" || path === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

