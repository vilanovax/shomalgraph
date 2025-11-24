import { auth } from "./lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // مسیرهای عمومی که نیاز به احراز هویت ندارند
  const publicPaths = ["/", "/auth/signin", "/api/auth"];
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // مسیرهای ادمین
  const isAdminPath = pathname.startsWith("/admin");

  // مسیرهای صاحب کسب‌وکار
  const isBusinessPath = pathname.startsWith("/business");

  // اگر کاربر لاگین نیست و به صفحه خصوصی می‌رود
  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // اگر کاربر لاگین است و به صفحه لاگین می‌رود
  if (isLoggedIn && pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // بررسی دسترسی ادمین
  if (isAdminPath && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // بررسی دسترسی صاحب کسب‌وکار
  if (isBusinessPath && req.auth?.user?.role !== "BUSINESS_OWNER") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
