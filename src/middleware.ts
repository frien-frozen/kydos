import NextAuth from "next-auth";
import { authConfig } from "./lib/auth.config";
import { hasAccess } from "./lib/permissions";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;
  const status = req.auth?.user?.status;
  const role = req.auth?.user?.role as string;
  const validUntil = (req.auth?.user as any)?.validUntil;

  // Global static asset + webhook fast path exclusion
  if (pathname.startsWith("/api/auth")) return;
  if (pathname.includes(".")) return; 

  if (!isLoggedIn) {
     if (pathname !== "/login" && pathname !== "/") {
       return Response.redirect(new URL("/login", req.nextUrl));
     }
     return;
  }

  // Suspended + Pending structural barriers
  if (status === "SUSPENDED" && pathname !== "/suspended") {
    return Response.redirect(new URL("/suspended", req.nextUrl));
  }
  if (status === "PENDING" && pathname !== "/pending") {
    return Response.redirect(new URL("/pending", req.nextUrl));
  }

  // Active TLS Time Bomb Enforcement for Students
  if (role === "STUDENT" && (pathname.startsWith("/dashboard") || pathname.startsWith("/courses"))) {
    if (!validUntil || new Date(validUntil) < new Date()) {
      if (pathname !== "/expired") {
        return Response.redirect(new URL("/expired", req.nextUrl));
      }
      return;
    }
  }

  // Exclude trapped UI views from matrix mapping evaluation loop
  const specialPages = ["/pending", "/suspended", "/expired"];
  if (specialPages.includes(pathname)) return;

  // The contextual home dashboard routing matrix
  const defaultRedirect = role === "STUDENT" ? "/dashboard" : 
                          role === "TEACHER" ? "/teacher/courses" : 
                          role === "ACCOUNTANT" ? "/accounting" : 
                          role === "ADMIN" ? "/admin" : "/pending";

  if (pathname === "/login" || pathname === "/") {
    return Response.redirect(new URL(defaultRedirect, req.nextUrl));
  }

  // Enforce rigid Role Capability mapping directly against normalized traffic
  if (!hasAccess(role, pathname)) {
    if (pathname !== defaultRedirect) {
      return Response.redirect(new URL(defaultRedirect, req.nextUrl));
    }
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
