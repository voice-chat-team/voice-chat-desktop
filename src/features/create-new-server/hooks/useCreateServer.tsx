import { SubmitHandler, useForm } from "react-hook-form";
import {
  CreateServerDtoSchema,
  CreateServerSchemaModel,
} from "../model/create-server.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { guildApi, userServersQueryKey } from "@/shared";

export const useCreateServer = (onSuccesCreateCb?: () => void) => {
  const queryClient = useQueryClient();

  const form = useForm<CreateServerSchemaModel>({
    mode: "onChange",
    resolver: zodResolver(CreateServerDtoSchema),
    defaultValues: {
      isPublic: false,
    },
  });

  const { mutateAsync } = useMutation({
    mutationKey: ["create-new-server"],
    mutationFn: async (createGuildDto: CreateServerSchemaModel) =>
      await guildApi.guildControllerCreateGuild(createGuildDto),
  });

  const onSubmit: SubmitHandler<CreateServerSchemaModel> = async (data) => {
    mutateAsync(data, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({
          queryKey: userServersQueryKey,
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
