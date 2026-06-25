import { z } from "zod/v4";
import type { LoginRequestDto } from "@/shared/api/generated";
import { schemaFor } from "@/shared";

export const LoginRequestDtoSchema = schemaFor<LoginRequestDto>()(
  z.object({
    email: z.email("Введите корректный email"),
    password: z.string().min(4, "Минимум 4 символа"),
  }),
);

export type LoginRequestDtoModel = z.infer<typeof LoginRequestDtoSchema>;
