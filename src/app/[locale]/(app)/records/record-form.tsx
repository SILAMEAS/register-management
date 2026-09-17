"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DISTRICTS, NONE_VALUE, PROVINCES } from "@/lib/locations";
import type { RecordFormState } from "./actions";

type RecordFormValues = {
  cardId: string;
  name: string;
  address: string;
  district?: string;
  province?: string;
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
        <Label htmlFor="district">{t("district")}</Label>
        <Select name="district" defaultValue={defaultValues?.district ?? NONE_VALUE}>
          <SelectTrigger id="district" className="w-full">
            <SelectValue>
              {(value: string) => (value === NONE_VALUE ? t("none") : value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>{t("none")}</SelectItem>
            {DISTRICTS.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.district && (
          <p className="text-sm text-destructive">
            {state.errors.district[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="province">{t("province")}</Label>
        <Select name="province" defaultValue={defaultValues?.province ?? NONE_VALUE}>
          <SelectTrigger id="province" className="w-full">
            <SelectValue>
              {(value: string) => (value === NONE_VALUE ? t("none") : value)}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>{t("none")}</SelectItem>
            {PROVINCES.map((province) => (
              <SelectItem key={province} value={province}>
                {province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {state?.errors?.province && (
          <p className="text-sm text-destructive">
            {state.errors.province[0]}
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
