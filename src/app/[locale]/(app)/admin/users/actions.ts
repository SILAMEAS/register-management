"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { buildCreateUserSchema } from "@/lib/validations";

export type UserFormState = {
  errors?: Partial<Record<"username" | "password" | "role", string[]>>;
  message?: string;
} | undefined;

export async function createUser(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await requireAdmin();
  const t = await getTranslations("Users");

  const parsed = buildCreateUserSchema(t).safeParse({
    username: formData.get("username"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { username, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { message: t("usernameTaken") };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { username, passwordHash, role },
  });

  const locale = await getLocale();
  revalidatePath(`/${locale}/admin/users`);
  return { message: t("userCreated", { username }) };
}
