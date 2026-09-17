"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { cn } from "cn";

import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  km: "ខ្មែរ",
};

export function LanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = useLocale();
  const query = searchParams.toString();
  const href = query ? `${pathname}?${query}` : pathname;

  return (
    <div className="flex items-center gap-1 text-sm">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={href}
          locale={locale}
          className={cn(
            "rounded px-1.5 py-0.5 transition-colors",
            locale === currentLocale
              ? "font-semibold text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {LOCALE_LABELS[locale]}
        </Link>
      ))}
    </div>
  );
}
