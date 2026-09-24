import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { CHANNEL_TYPE, guildApi, type ChannelTypeValue } from "@/shared";
import {
  CreateChannelDtoSchema,
  CreateChannelSchemaModel,
} from "../models/create-channel.model";

export const useCreateChannel = (
  guildId: string,
  channelType: ChannelTypeValue = CHANNEL_TYPE.TEXT,
  onSuccesCreateCb?: () => void,
) => {
  const queryClient = useQueryClient();

  const form = useForm<CreateChannelSchemaModel>({
    mode: "onChange",
    resolver: zodResolver(CreateChannelDtoSchema),
    defaultValues: {
      guildId,
      isPrivate: false,
      type: channelType,
    },
  });

  useEffect(() => {
    form.reset({
      guildId,
      isPrivate: false,
      type: channelType,
    });
  }, [guildId, channelType, form]);

  const { mutateAsync } = useMutation({
    mutationKey: ["create-new-channel"],
    mutationFn: async (createChannelDto: CreateChannelSchemaModel) =>
      await guildApi.guildControllerCreateChannels(createChannelDto),
  });

  const onSubmit: SubmitHandler<CreateChannelSchemaModel> = async (data) => {
    mutateAsync(data, {
      onSuccess: async () => {
        // Эндпоинт один на все типы каналов, а списки в сайдбаре разные,
        // поэтому инвалидируем оба.
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ["get-guild-text-channels", guildId],
          }),
          queryClient.invalidateQueries({
            queryKey: ["get-guild-voice-channels", guildId],
          }),
        ]);

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
