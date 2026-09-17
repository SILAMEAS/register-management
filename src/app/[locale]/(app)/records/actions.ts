"use server";

import { revalidatePath } from "next/cache";
import { getLocale, getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { redirect } from "@/i18n/navigation";
import { buildPersonRecordSchema } from "@/lib/validations";
import { toCsv } from "@/lib/csv";

export type RecordFormState = {
  errors?: Partial<Record<"cardId" | "name" | "address" | "dob" | "registeredAt", string[]>>;
  message?: string;
} | undefined;

function parseForm(formData: FormData, t: (key: string) => string) {
  return buildPersonRecordSchema(t).safeParse({
    cardId: formData.get("cardId"),
    name: formData.get("name"),
    address: formData.get("address"),
    dob: formData.get("dob"),
    registeredAt: formData.get("registeredAt"),
  });
}

export async function createRecord(
  _prevState: RecordFormState,
  formData: FormData
): Promise<RecordFormState> {
  const user = await requireUser();
  const t = await getTranslations("Records");
  const parsed = parseForm(formData, t);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { cardId, name, address, dob, registeredAt } = parsed.data;

  try {
    await prisma.personRecord.create({
      data: {
        cardId,
        name,
        address,
        dob: new Date(dob),
        registeredAt: new Date(registeredAt),
        createdById: user.id,
      },
    });
  } catch {
    return { message: t("duplicateCardId") };
  }

  const locale = await getLocale();
  revalidatePath(`/${locale}/records`);
  redirect({ href: "/records", locale });
}

export async function updateRecord(
  id: string,
  _prevState: RecordFormState,
  formData: FormData
): Promise<RecordFormState> {
  const user = await requireUser();
  const t = await getTranslations("Records");
  const parsed = parseForm(formData, t);

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.personRecord.findUnique({ where: { id } });
  if (!existing) {
    return { message: t("recordNotFound") };
  }
  if (user.role !== "ADMIN" && existing.createdById !== user.id) {
    return { message: t("notAllowedToEdit") };
  }

  const { cardId, name, address, dob, registeredAt } = parsed.data;

  try {
    await prisma.personRecord.update({
      where: { id },
      data: {
        cardId,
        name,
        address,
        dob: new Date(dob),
        registeredAt: new Date(registeredAt),
      },
    });
  } catch {
    return { message: t("duplicateCardId") };
  }

  const locale = await getLocale();
  revalidatePath(`/${locale}/records`);
  redirect({ href: "/records", locale });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-CA");
}

export async function exportRecords(deleteAfterExport: boolean) {
  const user = await requireUser();
  const t = await getTranslations("Records");
  const isAdmin = user.role === "ADMIN";

  const where = isAdmin ? undefined : { createdById: user.id };

  const records = await prisma.personRecord.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { username: true } } },
  });

  const headers = [
    t("cardId"),
    t("name"),
    t("address"),
    t("dob"),
    t("registeredAt"),
    ...(isAdmin ? [t("createdBy")] : []),
  ];

  const rows = records.map((record) => [
    record.cardId,
    record.name,
    record.address,
    formatDate(record.dob),
    formatDate(record.registeredAt),
    ...(isAdmin ? [record.createdBy.username] : []),
  ]);

  const csv = toCsv([headers, ...rows]);
  const filename = `records-export-${formatDate(new Date())}.csv`;

  if (deleteAfterExport && records.length > 0) {
    await prisma.personRecord.deleteMany({ where });
    const locale = await getLocale();
    revalidatePath(`/${locale}/records`);
  }

  return { csv, filename, count: records.length };
}

export async function deleteRecord(id: string) {
  const user = await requireUser();
  const t = await getTranslations("Records");

  const existing = await prisma.personRecord.findUnique({ where: { id } });
  if (!existing) return;
  if (user.role !== "ADMIN" && existing.createdById !== user.id) {
    throw new Error(t("notAllowedToDelete"));
  }

  await prisma.personRecord.delete({ where: { id } });
  const locale = await getLocale();
  revalidatePath(`/${locale}/records`);
}
