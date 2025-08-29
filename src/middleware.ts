import { NextRequest, NextResponse } from "next/server";
import {
  isAuthenticated,
  refreshAccessToken,
  refreshAccessTokenOptional,
} from "@/lib/session";

export async function middleware(request: NextRequest) {
  const visitorOnlyRoutes = ["/login", "/signup"];
  const protectedRoutes = ["/blogs/new", "/settings", "/blogs/[id]/edit", "/admin"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  const isVisitorOnlyRoute = visitorOnlyRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!(await isAuthenticated())) {
      try {
        const data = await refreshAccessToken();
        const response = NextResponse.next();

        response.cookies.set("accessToken", data.accessToken, {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
        });

        return response;
      } catch {
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");

        return response;
      }
    }
  } else if (isVisitorOnlyRoute) {
    if (await isAuthenticated()) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    if (!(await isAuthenticated())) {
      try {
        const data = await refreshAccessTokenOptional();
        const response = NextResponse.next();

        if (data) {
          response.cookies.set("accessToken", data.accessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
          });
        }

        return response;
      } catch {
        const response = NextResponse.next();
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");

        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher:
    "/((?!api|_next/static|_next/image|favicon.ico|uploads|sitemap.xml|robots.txt).*)",
};