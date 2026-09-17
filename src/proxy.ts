import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";

import { auth } from "@/auth";
import { routing } from "@/i18n/routing";

const handleIntlRouting = createIntlMiddleware(routing);

const PUBLIC_ROUTES = ["/login"];
const LOCALE_PREFIX = new RegExp(`^/(${routing.locales.join("|")})(?=/|$)`);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const localeMatch = pathname.match(LOCALE_PREFIX);
  const locale = localeMatch?.[1] ?? routing.defaultLocale;
  const pathWithoutLocale = pathname.replace(LOCALE_PREFIX, "") || "/";

  const isPublicRoute = PUBLIC_ROUTES.includes(pathWithoutLocale);
  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl));
  }

  if (isLoggedIn && isPublicRoute) {
    return NextResponse.redirect(new URL(`/${locale}/records`, req.nextUrl));
  }

  return handleIntlRouting(req);
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
