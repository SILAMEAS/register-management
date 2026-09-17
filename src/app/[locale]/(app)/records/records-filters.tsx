import { getTranslations } from "next-intl/server";

import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { DISTRICTS, PROVINCES } from "@/lib/locations";

export type RecordFiltersValues = {
  q: string;
  district: string;
  province: string;
  dobFrom: string;
  dobTo: string;
  registeredFrom: string;
  registeredTo: string;
};

const selectClassName =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export async function RecordsFilters({
  defaultValues,
  pageSize,
}: {
  defaultValues: RecordFiltersValues;
  pageSize: number;
}) {
  const t = await getTranslations("Records");

  return (
    <form
      method="get"
      className="flex flex-col gap-3 rounded-md border p-4 text-sm"
    >
      <input type="hidden" name="pageSize" value={pageSize} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="q">{t("search")}</Label>
          <Input
            id="q"
            name="q"
            type="text"
            defaultValue={defaultValues.q}
            placeholder={t("searchPlaceholder")}
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="district">{t("district")}</Label>
          <select
            id="district"
            name="district"
            defaultValue={defaultValues.district}
            className={selectClassName}
          >
            <option value="">{t("allDistricts")}</option>
            {DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="province">{t("province")}</Label>
          <select
            id="province"
            name="province"
            defaultValue={defaultValues.province}
            className={selectClassName}
          >
            <option value="">{t("allProvinces")}</option>
            {PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="dobFrom">
            {t("dob")} {t("from")}
          </Label>
          <Input
            id="dobFrom"
            name="dobFrom"
            type="date"
            defaultValue={defaultValues.dobFrom}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="dobTo">
            {t("dob")} {t("to")}
          </Label>
          <Input
            id="dobTo"
            name="dobTo"
            type="date"
            defaultValue={defaultValues.dobTo}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="registeredFrom">
            {t("registeredAt")} {t("from")}
          </Label>
          <Input
            id="registeredFrom"
            name="registeredFrom"
            type="date"
            defaultValue={defaultValues.registeredFrom}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="registeredTo">
            {t("registeredAt")} {t("to")}
          </Label>
          <Input
            id="registeredTo"
            name="registeredTo"
            type="date"
            defaultValue={defaultValues.registeredTo}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" className={buttonVariants({ size: "sm" })}>
          {t("applyFilters")}
        </button>
        <Link
          href="/records"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          {t("clearFilters")}
        </Link>
      </div>
    </form>
  );
}
