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

type Record = {
  id: string;
  cardId: string;
  name: string;
  address: string;
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
}: {
  records: Record[];
  showCreatedBy: boolean;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}) {
  const t = await getTranslations("Records");

  if (records.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
        {t("noRecordsYet")}
      </p>
    );
  }

  const columnCount = showCreatedBy ? 7 : 6;

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("cardId")}</TableHead>
            <TableHead>{t("name")}</TableHead>
            <TableHead>{t("address")}</TableHead>
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
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
