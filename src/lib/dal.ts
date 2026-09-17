import "server-only";
import { cache } from "react";
import { getLocale } from "next-intl/server";

import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";

export const getCurrentUser = cache(async () => {
  const session = await auth();
  return session?.user ?? null;
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (user) return user;

  const locale = await getLocale();
  return redirect({ href: "/login", locale });
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role === "ADMIN") return user;

  const locale = await getLocale();
  return redirect({ href: "/records", locale });
}
