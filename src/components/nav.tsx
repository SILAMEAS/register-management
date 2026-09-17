import { getTranslations } from "next-intl/server";

import { logout } from "@/app/[locale]/(app)/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function Nav({
  username,
  role,
}: {
  username: string;
  role: "ADMIN" | "USER";
}) {
  const t = await getTranslations("Nav");

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="font-semibold">{t("appName")}</span>
          <nav className="flex items-center gap-3 text-sm">
            <Link href="/records" className="text-muted-foreground hover:text-foreground">
              {t("records")}
            </Link>
            {role === "ADMIN" && (
              <Link
                href="/admin/users"
                className="text-muted-foreground hover:text-foreground"
              >
                {t("users")}
              </Link>
            )}
          </nav>
          <Badge variant={role === "ADMIN" ? "default" : "secondary"}>
            {role === "ADMIN" ? t("roleAdmin") : t("roleUser")}
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <span className="text-sm text-muted-foreground">{username}</span>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              {t("signOut")}
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
