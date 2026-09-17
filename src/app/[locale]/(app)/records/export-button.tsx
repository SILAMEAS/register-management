"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { exportRecords } from "./actions";

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function ExportButton({ total }: { total: number }) {
  const t = useTranslations("Export");
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleExport(deleteAfterExport: boolean) {
    startTransition(async () => {
      try {
        const result = await exportRecords(deleteAfterExport);
        downloadCsv(result.csv, result.filename);
        toast.success(
          deleteAfterExport
            ? t("successDelete", { count: result.count })
            : t("successKeep", { count: result.count })
        );
        setOpen(false);
      } catch {
        toast.error(t("failed"));
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" disabled={total === 0} />}>
        {t("button")}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dialogTitle")}</DialogTitle>
          <DialogDescription>
            {t("description", { count: total })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" disabled={isPending} />}>
            {t("cancelButton")}
          </DialogClose>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => handleExport(true)}
          >
            {isPending ? t("exporting") : t("deleteButton")}
          </Button>
          <Button disabled={isPending} onClick={() => handleExport(false)}>
            {isPending ? t("exporting") : t("keepButton")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
