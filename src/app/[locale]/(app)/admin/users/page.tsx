import { getTranslations } from "next-intl/server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/dal";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserForm } from "./user-form";

export default async function UsersPage() {
  await requireAdmin();
  const t = await getTranslations("Users");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      _count: { select: { records: true } },
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("username")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead>{t("recordsCreated")}</TableHead>
              <TableHead>{t("created")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                    {user.role === "ADMIN" ? t("roleAdmin") : t("roleUser")}
                  </Badge>
                </TableCell>
                <TableCell>{user._count.records}</TableCell>
                <TableCell>{user.createdAt.toLocaleDateString("en-CA")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold">{t("createUserTitle")}</h2>
        <UserForm />
      </div>
    </div>
  );
}
