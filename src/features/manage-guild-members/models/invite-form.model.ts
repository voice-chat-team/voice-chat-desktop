import { z } from "zod/v4";
import { CreateInvitationRequestDto, schemaFor } from "@/shared";

export const CreateInviteDtoSchema = schemaFor<CreateInvitationRequestDto>()(
  z.object({
    guildId: z.string().nonempty(),
    receiverId: z.string().nonempty(),
  })
)

export type CreateInviteDtoModel = z.infer<typeof CreateInviteDtoSchema>;
