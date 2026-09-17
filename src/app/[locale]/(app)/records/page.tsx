import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { RecordsTable } from "./records-table";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "./records-pagination";
import { ExportButton } from "./export-button";

function parsePageSize(value: string | undefined) {
  const parsed = Number(value);
  return PAGE_SIZE_OPTIONS.includes(parsed as (typeof PAGE_SIZE_OPTIONS)[number])
    ? parsed
    : DEFAULT_PAGE_SIZE;
}

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const t = await getTranslations("Records");

  const params = await searchParams;
  const pageSize = parsePageSize(params.pageSize);
  const requestedPage = Math.max(1, Number(params.page) || 1);

  const where = isAdmin ? undefined : { createdById: user.id };

  const total = await prisma.personRecord.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);

  const records = await prisma.personRecord.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { createdBy: { select: { username: true } } },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {isAdmin ? t("allRecordsTitle") : t("myRecordsTitle")}
        </h1>
        <div className="flex items-center gap-2">
          <ExportButton total={total} />
          <Link href="/records/new" className={buttonVariants()}>
            {t("newRecord")}
          </Link>
        </div>
      </div>
      <RecordsTable
        records={records}
        showCreatedBy={isAdmin}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
      />
    </div>
  );
}
