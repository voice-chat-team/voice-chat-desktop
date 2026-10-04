import { useQuery, type QueryClient } from "@tanstack/react-query";

import { boardApi } from "@/shared/api/client";
import type { BoardDto } from "@/shared/api/generated/models/board-dto";

export const guildBoardsQueryKey = (guildId: string) => [
  "guild-boards",
  guildId,
];

/**
 * Доски сервера. Создание, переименование и удаление другими участниками
 * приезжают событиями BOARD_* в канал guild:{guildId} и пишутся прямо в кэш.
 */
export const useGuildBoardsQuery = (guildId: string) =>
  useQuery({
    queryKey: guildBoardsQueryKey(guildId),
    queryFn: async ({ signal }) => {
      const { data } = await boardApi.boardControllerGetGuildBoards(guildId, {
        signal,
      });

      // gRPC-клиент на гейтвее отдаёт undefined вместо пустого repeated-поля.
      return data.boards ?? [];
    },
    enabled: Boolean(guildId),
    staleTime: 60_000,
  });

export const upsertGuildBoard = (queryClient: QueryClient, board: BoardDto) => {
  queryClient.setQueryData(
    guildBoardsQueryKey(board.guildId),
    (old: BoardDto[] | undefined) => {
      if (!old) return old;

      const index = old.findIndex((b) => b.id === board.id);
      if (index === -1) return [...old, board];

      const next = old.slice();
      next[index] = board;

      return next;
    },
  );
};

export const removeGuildBoard = (
  queryClient: QueryClient,
  guildId: string,
  boardId: string,
) => {
  queryClient.setQueryData(
    guildBoardsQueryKey(guildId),
    (old: BoardDto[] | undefined) => old?.filter((b) => b.id !== boardId),
  );
};
