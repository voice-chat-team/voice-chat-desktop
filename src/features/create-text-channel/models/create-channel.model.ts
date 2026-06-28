import { z } from "zod/v4";
import { type CreateChannelDto, schemaFor } from "@/shared";

export const CreateChannelDtoSchema = schemaFor<CreateChannelDto>()(
  z.object({
    guildId: z.string(),
    name: z.string().nonempty(),
    type: z.number(),
    isPrivate: z.boolean(),
  }),
);

export type CreateChannelSchemaModel = z.infer<typeof CreateChannelDtoSchema>;
