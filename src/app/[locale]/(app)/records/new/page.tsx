import { getTranslations } from "next-intl/server";

import { createRecord } from "../actions";
import { RecordForm } from "../record-form";

export default async function NewRecordPage() {
  const t = await getTranslations("Records");

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">
        {t("newRecordPageTitle")}
      </h1>
      <RecordForm action={createRecord} submitLabel={t("createButton")} />
    </div>
  );
}
