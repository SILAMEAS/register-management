import * as z from "zod";

type Translator = (key: string) => string;

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export function buildPersonRecordSchema(t: Translator) {
  return z.object({
    cardId: z.string().trim().min(1, t("cardIdRequired")).max(64),
    name: z.string().trim().min(1, t("nameRequired")).max(200),
    address: z.string().trim().min(1, t("addressRequired")).max(500),
    dob: z.iso.date(t("dobInvalid")),
    registeredAt: z.iso.date(t("registeredAtInvalid")),
  });
}

export type PersonRecordInput = z.infer<
  ReturnType<typeof buildPersonRecordSchema>
>;

export function buildCreateUserSchema(t: Translator) {
  return z.object({
    username: z
      .string()
      .trim()
      .min(3, t("usernameTooShort"))
      .max(50)
      .regex(/^[a-zA-Z0-9_.-]+$/, t("usernameInvalidChars")),
    password: z.string().min(8, t("passwordTooShort")),
    role: z.enum(["ADMIN", "USER"]),
  });
}

export type CreateUserInput = z.infer<ReturnType<typeof buildCreateUserSchema>>;
