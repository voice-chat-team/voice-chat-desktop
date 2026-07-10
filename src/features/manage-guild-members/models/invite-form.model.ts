import { z } from "zod/v4";
import { CreateInvitationRequestDto, CreateInvitationRequestDtoInvitedRoleEnum, schemaFor } from "@/shared";

export const CreateInviteDtoSchema = schemaFor<CreateInvitationRequestDto>()(
  z.object({
    guildId: z.string().nonempty(),
    receiverId: z.string().nonempty(),
    invitedRole: z.enum(CreateInvitationRequestDtoInvitedRoleEnum),
  })
)

export type CreateInviteDtoModel = z.infer<typeof CreateInviteDtoSchema>;
