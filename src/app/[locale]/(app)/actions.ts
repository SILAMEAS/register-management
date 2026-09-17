"use server";

import { getLocale } from "next-intl/server";

import { signOut } from "@/auth";

export async function logout() {
  const locale = await getLocale();
  await signOut({ redirectTo: `/${locale}/login` });
}
