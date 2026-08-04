import {
  CreateInviteDtoModel,
  CreateInviteDtoSchema,
} from "../models/invite-form.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateInvitationRequestDtoInvitedRoleEnum, inviteApi } from "@/shared";
import { SubmitHandler, useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useInviteUsers = (guildId: string) => {
  const form = useForm<CreateInviteDtoModel>({
    mode: "onChange",
    resolver: zodResolver(CreateInviteDtoSchema),
    defaultValues: {
      guildId,
      invitedRole: CreateInvitationRequestDtoInvitedRoleEnum.NUMBER_3,
    },
  });

  const { mutateAsync } = useMutation({
    mutationKey: ["create-invite"],
    mutationFn: async (data: CreateInviteDtoModel) =>
      inviteApi.invitationControllerCreateInvitation(data),
  });

  const onSubmit: SubmitHandler<CreateInviteDtoModel> = async (data) => {
    toast.promise(
      mutateAsync(data, {
        onSuccess: () => {
          form.resetField("receiverId");
        },
      }),
      {
        loading: "Отправка приглашения...",
        success: "Приглашение успешно отправлено!",
        error: "Не удалось отправить приглашение!",
      },
    );
    // await mutateAsync(data, {
    //   onSuccess: (response) => {
    //     console.log(response.data.invitation);
    //     reset();
    //   },
    // });
  };

  return {
    onSubmit,
    form,
  };
};
