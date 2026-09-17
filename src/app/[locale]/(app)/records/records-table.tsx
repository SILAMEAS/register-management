import { getTranslations } from "next-intl/server";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { DeleteRecordButton } from "./delete-record-button";
import { RecordsPagination } from "./records-pagination";
import type { RecordFiltersValues } from "./records-filters";

type Record = {
  id: string;
  cardId: string;
  name: string;
  address: string;
  district: string | null;
  province: string | null;
  dob: Date;
  registeredAt: Date;
  createdBy: { username: string };
};

function formatDate(date: Date) {
  return date.toLocaleDateString("en-CA");
}

export async function RecordsTable({
  records,
  showCreatedBy,
  page,
  pageSize,
  total,
  totalPages,
  filters,
}: {
  records: Record[];
  showCreatedBy: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  filters: RecordFiltersValues;
}) {
  const t = await getTranslations("Records");
  const hasActiveFilters = Object.values(filters).some(Boolean);

  if (records.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        {hasActiveFilters ? t("noRecordsMatch") : t("noRecordsYet")}
      </p>
    );
  }

  const columnCount = showCreatedBy ? 9 : 8;

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("cardId")}</TableHead>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("address")}</TableHead>
            <TableHead>{t("district")}</TableHead>
            <TableHead>{t("province")}</TableHead>
            <TableHead>{t("dob")}</TableHead>
            <TableHead>{t("registeredAt")}</TableHead>
            {showCreatedBy && <TableHead>{t("createdBy")}</TableHead>}
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{record.cardId}</TableCell>
              <TableCell>{record.name}</TableCell>
              <TableCell className="max-w-xs truncate">
                {record.address}
              </TableCell>
              <TableCell>{record.district ?? ""}</TableCell>
              <TableCell>{record.province ?? ""}</TableCell>
              <TableCell>{formatDate(record.dob)}</TableCell>
              <TableCell>{formatDate(record.registeredAt)}</TableCell>
              {showCreatedBy && (
                <TableCell>{record.createdBy.username}</TableCell>
              )}
              <TableCell className="flex justify-end gap-2 text-right">
                <Link
                  href={`/records/${record.id}/edit`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {t("edit")}
                </Link>
                <DeleteRecordButton id={record.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={columnCount} className="p-3">
              <RecordsPagination
                page={page}
                pageSize={pageSize}
                total={total}
                totalPages={totalPages}
                filters={filters}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
