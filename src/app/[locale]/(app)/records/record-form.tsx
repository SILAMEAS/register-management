"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { RecordFormState } from "./actions";

type RecordFormValues = {
  cardId: string;
  name: string;
  address: string;
  dob: string;
  registeredAt: string;
};

export function RecordForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (
    state: RecordFormState,
    formData: FormData
  ) => Promise<RecordFormState>;
  defaultValues?: RecordFormValues;
  submitLabel: string;
}) {
  const t = useTranslations("Records");
  const [state, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="cardId">{t("cardId")}</Label>
        <Input
          id="cardId"
          name="cardId"
          defaultValue={defaultValues?.cardId}
          required
        />
        {state?.errors?.cardId && (
          <p className="text-sm text-destructive">{state.errors.cardId[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">{t("name")}</Label>
        <Input
          id="name"
          name="name"
          defaultValue={defaultValues?.name}
          required
        />
        {state?.errors?.name && (
          <p className="text-sm text-destructive">{state.errors.name[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="address">{t("address")}</Label>
        <Input
          id="address"
          name="address"
          defaultValue={defaultValues?.address}
          required
        />
        {state?.errors?.address && (
          <p className="text-sm text-destructive">
            {state.errors.address[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="dob">{t("dob")}</Label>
        <Input
          id="dob"
          name="dob"
          type="date"
          defaultValue={defaultValues?.dob}
          required
        />
        {state?.errors?.dob && (
          <p className="text-sm text-destructive">{state.errors.dob[0]}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="registeredAt">{t("registeredAt")}</Label>
        <Input
          id="registeredAt"
          name="registeredAt"
          type="date"
          defaultValue={defaultValues?.registeredAt}
          required
        />
        {state?.errors?.registeredAt && (
          <p className="text-sm text-destructive">
            {state.errors.registeredAt[0]}
          </p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-destructive">{state.message}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? t("saving") : submitLabel}
        </Button>
      </div>
    </form>
  );
}
