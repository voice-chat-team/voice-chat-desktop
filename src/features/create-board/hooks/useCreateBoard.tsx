import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useBoardStore } from "@/entities/board";
import { useServerStore } from "@/entities/server";

import {
  CreateBoardSchema,
  CreateBoardSchemaModel,
} from "../models/create-board.model";

export const useCreateBoard = (
  guildId: string,
  onSuccesCreateCb?: () => void,
) => {
  const createBoard = useBoardStore((store) => store.actions.createBoard);
  const setActiveBoard = useServerStore((store) => store.actions.setActiveBoard);

  const form = useForm<CreateBoardSchemaModel>({
    mode: "onChange",
    resolver: zodResolver(CreateBoardSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit: SubmitHandler<CreateBoardSchemaModel> = (data) => {
    const board = createBoard(guildId, data.name);

    form.reset();
    // Только что созданную доску сразу открываем в центральной панели.
    setActiveBoard(board);

    onSuccesCreateCb && onSuccesCreateCb();
  };

  return {
    form,
    onSubmit,
  };
};
