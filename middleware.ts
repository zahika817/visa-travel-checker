import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log(
    "PROXY RUNNING:",
    request.nextUrl.pathname,
  );

  const session = request.cookies.get(
    "visa_admin_session",
  )?.value;

  const pathname = request.nextUrl.pathname;

  if (
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login" &&
    !session
  ) {
    return NextResponse.redirect(
      new URL("/admin/login", request.url),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/admin/:path*",
};
