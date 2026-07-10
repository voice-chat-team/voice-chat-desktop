import { Button, CreateInvitationRequestDtoInvitedRoleEnum, FormInput,  inviteApi } from "@/shared";
import { UserPlus } from "lucide-react";
import { SubmitHandler, useForm } from "react-hook-form";
import { CreateInviteDtoModel, CreateInviteDtoSchema } from "../models/invite-form.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useServerStore } from "@/entities/server";
import { useMutation } from "@tanstack/react-query";

export const InviteSection = () => {
  const guildId = useServerStore(store => store.state.guild?.id);
  const {register, handleSubmit, formState: { isValid }, reset} = useForm<CreateInviteDtoModel>({
    mode: 'onChange',
    resolver: zodResolver(CreateInviteDtoSchema),
    defaultValues: {
      guildId,
      invitedRole: CreateInvitationRequestDtoInvitedRoleEnum.NUMBER_3
    }
  })

  const { mutateAsync } = useMutation({
    mutationKey: ['create-invite'],
    mutationFn: async (data: CreateInviteDtoModel) => inviteApi.invitationControllerCreateInvitation(data)
  })

  const onSubmit: SubmitHandler<CreateInviteDtoModel> = async (data) => {

    await mutateAsync(data, {
      onSuccess: (response) => {
        console.log(response.data.invitation);
        reset()
      }
    });
  }

  return (
    <div className="space-y-2">

      <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 items-end">
        <FormInput
          labelTitle="Пригласить участника"
          autoComplete="off"
          placeholder="ID пользователя"
          wrapperClassName="w-full"
          {...register('receiverId', { required: true })}
        />
        <Button className="bg-violet-600 hover:bg-violet-700 h-8" type="submit" disabled={!isValid}>
          Отправить
          <UserPlus />
        </Button>
      </form>
    </div>
  );
};
