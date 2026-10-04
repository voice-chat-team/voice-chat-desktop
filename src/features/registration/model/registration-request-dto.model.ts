import { z } from "zod/v4";
import type { RegistrationRequestDto } from "@/shared/api/generated";
import { schemaFor } from "@/shared";

export const RegistrationRequestDtoSchema = schemaFor<RegistrationRequestDto>()(
  z.object({
    username: z
      .string()
      .trim()
      .min(1, "Введите имя пользователя")
      .max(32, "Максимум 32 символа"),
    email: z.email("Введите корректный email"),
    password: z.string().min(4, "Минимум 4 символа"),
  }),
);

export const RegistrationFormSchema = RegistrationRequestDtoSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Пароли не совпадают",
  path: ["confirmPassword"],
});

export type RegistrationFormModel = z.infer<typeof RegistrationFormSchema>;
