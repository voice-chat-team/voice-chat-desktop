import { z } from "zod/v4";

export const GUILD_NAME_MAX_LENGTH = 100;
export const GUILD_DESCRIPTION_MAX_LENGTH = 500;

export const GeneralSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .nonempty("Введите название сервера")
    .max(
      GUILD_NAME_MAX_LENGTH,
      `Название — не длиннее ${GUILD_NAME_MAX_LENGTH} символов`,
    ),
  description: z
    .string()
    .max(
      GUILD_DESCRIPTION_MAX_LENGTH,
      `Описание — не длиннее ${GUILD_DESCRIPTION_MAX_LENGTH} символов`,
    ),
});

export type GeneralSettingsModel = z.infer<typeof GeneralSettingsSchema>;
