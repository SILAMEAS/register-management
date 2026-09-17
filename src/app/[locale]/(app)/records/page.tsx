import { getTranslations } from "next-intl/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { DISTRICTS, PROVINCES } from "@/lib/locations";
import { RecordsTable } from "./records-table";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "./records-pagination";
import { ExportButton } from "./export-button";
import { RecordsFilters } from "./records-filters";

function parsePageSize(value: string | undefined) {
  const parsed = Number(value);
  return PAGE_SIZE_OPTIONS.includes(parsed as (typeof PAGE_SIZE_OPTIONS)[number])
    ? parsed
    : DEFAULT_PAGE_SIZE;
}

function normalizeOption(
  value: string | undefined,
  options: readonly string[]
) {
  return value && options.includes(value) ? value : undefined;
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDateStart(value: string | undefined) {
  if (!value || !DATE_ONLY_PATTERN.test(value)) return undefined;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseDateEnd(value: string | undefined) {
  if (!value || !DATE_ONLY_PATTERN.test(value)) return undefined;
  const date = new Date(`${value}T23:59:59.999Z`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

type RecordsSearchParams = {
  page?: string;
  pageSize?: string;
  q?: string;
  district?: string;
  province?: string;
  dobFrom?: string;
  dobTo?: string;
  registeredFrom?: string;
  registeredTo?: string;
};

export default async function RecordsPage({
  searchParams,
}: {
  searchParams: Promise<RecordsSearchParams>;
}) {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";
  const t = await getTranslations("Records");

  const params = await searchParams;
  const pageSize = parsePageSize(params.pageSize);
  const requestedPage = Math.max(1, Number(params.page) || 1);

  const q = params.q?.trim().slice(0, 200);
  const district = normalizeOption(params.district, DISTRICTS);
  const province = normalizeOption(params.province, PROVINCES);
  const dobFrom = parseDateStart(params.dobFrom);
  const dobTo = parseDateEnd(params.dobTo);
  const registeredFrom = parseDateStart(params.registeredFrom);
  const registeredTo = parseDateEnd(params.registeredTo);

  const where: Prisma.PersonRecordWhereInput = {
    ...(isAdmin ? {} : { createdById: user.id }),
    ...(q && {
      OR: [
        { cardId: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(district && { district }),
    ...(province && { province }),
    ...((dobFrom || dobTo) && {
      dob: {
        ...(dobFrom && { gte: dobFrom }),
        ...(dobTo && { lte: dobTo }),
      },
    }),
    ...((registeredFrom || registeredTo) && {
      registeredAt: {
        ...(registeredFrom && { gte: registeredFrom }),
        ...(registeredTo && { lte: registeredTo }),
      },
    }),
  };

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

  const filters = {
    q: q ?? "",
    district: district ?? "",
    province: province ?? "",
    dobFrom: params.dobFrom ?? "",
    dobTo: params.dobTo ?? "",
    registeredFrom: params.registeredFrom ?? "",
    registeredTo: params.registeredTo ?? "",
  };

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
      <RecordsFilters defaultValues={filters} pageSize={pageSize} />
      <RecordsTable
        records={records}
        showCreatedBy={isAdmin}
        page={page}
        pageSize={pageSize}
        total={total}
        totalPages={totalPages}
        filters={filters}
      />
    </div>
  );
}
