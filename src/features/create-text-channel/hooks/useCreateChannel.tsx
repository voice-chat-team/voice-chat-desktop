import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { guildApi } from "@/shared";
import {
  CreateChannelDtoSchema,
  CreateChannelSchemaModel,
} from "../models/create-channel.model";

export const useCreateChannel = (
  guildId: string,
  onSuccesCreateCb?: () => void,
) => {
  const queryClient = useQueryClient();

  const form = useForm<CreateChannelSchemaModel>({
    mode: "onChange",
    resolver: zodResolver(CreateChannelDtoSchema),
    defaultValues: {
      guildId,
      isPrivate: false,
      type: 0,
    },
  });

  const { mutateAsync } = useMutation({
    mutationKey: ["create-new-channel"],
    mutationFn: async (createChannelDto: CreateChannelSchemaModel) =>
      await guildApi.guildControllerCreateChannels(createChannelDto),
  });

  const onSubmit: SubmitHandler<CreateChannelSchemaModel> = async (data) => {
    mutateAsync(data, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: ["get-guild-text-channels", guildId],
        });

        form.reset();

        onSuccesCreateCb && onSuccesCreateCb();
      },
    });
  };

  return {
    form,
    onSubmit,
  };
};
