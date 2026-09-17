import { getTranslations } from "next-intl/server";
import { cn } from "cn";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_PAGE_SIZE = 20;

function hrefFor(page: number, pageSize: number) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  });
  return `/records?${params.toString()}`;
}

export async function RecordsPagination({
  page,
  pageSize,
  total,
  totalPages,
}: {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}) {
  const t = await getTranslations("Pagination");

  if (total === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <span>{t("showing", { from, to, total })}</span>

      <div className="flex items-center gap-2">
        <span>{t("rowsPerPage")}:</span>
        {PAGE_SIZE_OPTIONS.map((size) => (
          <Link
            key={size}
            href={hrefFor(1, size)}
            className={cn(
              "rounded px-1.5 py-0.5",
              size === pageSize
                ? "font-semibold text-foreground"
                : "hover:text-foreground"
            )}
          >
            {size}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={hrefFor(Math.max(1, page - 1), pageSize)}
          aria-disabled={page <= 1}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            page <= 1 && "pointer-events-none opacity-50"
          )}
        >
          {t("previous")}
        </Link>
        <span>{t("pageOf", { page, totalPages })}</span>
        <Link
          href={hrefFor(Math.min(totalPages, page + 1), pageSize)}
          aria-disabled={page >= totalPages}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            page >= totalPages && "pointer-events-none opacity-50"
          )}
        >
          {t("next")}
        </Link>
      </div>
    </div>
  );
}
