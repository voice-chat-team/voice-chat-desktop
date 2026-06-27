import { z } from "zod/v4";
import { type CreateGuildDto, schemaFor } from "@/shared";

export const CreateServerDtoSchema = schemaFor<CreateGuildDto>()(
  z.object({
    name: z.string().nonempty(),
    description: z.string().nullable(),
    isPublic: z.boolean().nullable(),
  }),
);

export type CreateServerSchemaModel = z.infer<typeof CreateServerDtoSchema>;
