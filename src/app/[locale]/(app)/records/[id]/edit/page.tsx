import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { updateRecord } from "../../actions";
import { RecordForm } from "../../record-form";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function EditRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const t = await getTranslations("Records");

  const record = await prisma.personRecord.findUnique({ where: { id } });
  if (!record) notFound();
  if (user.role !== "ADMIN" && record.createdById !== user.id) notFound();

  const boundUpdateRecord = updateRecord.bind(null, id);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">
        {t("editRecordPageTitle")}
      </h1>
      <RecordForm
        action={boundUpdateRecord}
        submitLabel={t("saveButton")}
        defaultValues={{
          cardId: record.cardId,
          name: record.name,
          address: record.address,
          dob: toDateInputValue(record.dob),
          registeredAt: toDateInputValue(record.registeredAt),
        }}
      />
    </div>
  );
}
