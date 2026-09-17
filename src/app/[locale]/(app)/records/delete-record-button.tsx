"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteRecord } from "./actions";

export function DeleteRecordButton({ id }: { id: string }) {
  const t = useTranslations("Records");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(t("deleteConfirm"))) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteRecord(id);
        toast.success(t("deleteSuccess"));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("deleteFailed"));
      }
    });
  }

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={isPending}
    >
      {isPending ? t("deleting") : t("delete")}
    </Button>
  );
}
