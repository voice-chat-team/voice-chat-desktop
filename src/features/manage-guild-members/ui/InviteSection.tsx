import { Button, FormInput } from "@/shared";
import { UserPlus } from "lucide-react";
import { useServerStore } from "@/entities/server";
import { useInviteUsers } from "../hooks/useInviteUsers";

export const InviteSection = () => {
  const guildId = useServerStore((store) => store.state.guild?.id);

  const { form, onSubmit } = useInviteUsers(guildId!);

  return (
    <div className="space-y-2">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-2 items-end"
      >
        <FormInput
          labelTitle="Пригласить участника"
          autoComplete="off"
          placeholder="ID пользователя"
          wrapperClassName="w-full"
          {...form.register("receiverId", { required: true })}
        />
        <Button
          className="bg-violet-600 hover:bg-violet-700 h-8"
          type="submit"
          disabled={!form.formState.isValid}
        >
          Отправить
          <UserPlus />
        </Button>
      </form>
    </div>
  );
};
