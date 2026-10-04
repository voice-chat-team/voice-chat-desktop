import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { boardApi, upsertGuildBoard } from "@/shared";
import { useServerStore } from "@/entities/server";

import {
  CreateBoardSchema,
  CreateBoardSchemaModel,
} from "../models/create-board.model";

export const useCreateBoard = (
  guildId: string,
  onSuccesCreateCb?: () => void,
) => {
  const queryClient = useQueryClient();
  const setActiveBoard = useServerStore(
    (store) => store.actions.setActiveBoard,
  );

  const form = useForm<CreateBoardSchemaModel>({
    mode: "onChange",
    resolver: zodResolver(CreateBoardSchema),
    defaultValues: {
      name: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (name: string) => {
      const { data } = await boardApi.boardControllerCreateBoard({
        guildId,
        name,
      });

      return data.board;
    },
    onSuccess: (board) => {
      upsertGuildBoard(queryClient, board);

      form.reset();
      setActiveBoard(board);
      onSuccesCreateCb && onSuccesCreateCb();
    },
    onError: () => {
      toast.error("Не удалось создать доску");
    },
  });

  const onSubmit: SubmitHandler<CreateBoardSchemaModel> = (data) => {
    mutate(data.name);
  };

  return {
    form,
    onSubmit,
    isPending,
  };
};
