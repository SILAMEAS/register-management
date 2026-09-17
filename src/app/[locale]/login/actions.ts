"use server";

import { AuthError } from "next-auth";
import { getLocale, getTranslations } from "next-intl/server";

import { signIn } from "@/auth";

export async function login(
  _prevState: string | undefined,
  formData: FormData
) {
  const locale = await getLocale();

  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: `/${locale}/records`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const t = await getTranslations({ locale, namespace: "Login" });
      return t("invalidCredentials");
    }
    throw error;
  }
}
