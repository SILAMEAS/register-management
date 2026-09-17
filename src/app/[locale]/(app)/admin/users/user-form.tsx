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
import { createUser } from "./actions";

const initialState = undefined;

export function UserForm() {
  const t = useTranslations("Users");
  const [state, formAction, isPending] = useActionState(
    createUser,
    initialState
  );

  return (
    <form action={formAction} className="flex max-w-md flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="username">{t("username")}</Label>
        <Input id="username" name="username" required autoComplete="off" />
        {state?.errors?.username && (
          <p className="text-sm text-destructive">
            {state.errors.username[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">{t("temporaryPassword")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
        />
        {state?.errors?.password && (
          <p className="text-sm text-destructive">
            {state.errors.password[0]}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="role">{t("role")}</Label>
        <Select name="role" defaultValue="USER">
          <SelectTrigger id="role" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USER">{t("roleUser")}</SelectItem>
            <SelectItem value="ADMIN">{t("roleAdmin")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {state?.message && (
        <p
          className={
            state.errors ? "text-sm text-destructive" : "text-sm text-foreground"
          }
        >
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? t("creating") : t("createButton")}
      </Button>
    </form>
  );
}
