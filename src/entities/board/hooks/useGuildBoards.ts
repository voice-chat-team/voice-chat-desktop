import { useGuildBoardsQuery, type BoardDto } from "@/shared";

/** Стабильная ссылка, чтобы потребители не перерисовывались, пока нет данных. */
const EMPTY_BOARDS: BoardDto[] = [];

/** Список досок гильдии. */
export const useGuildBoards = (guildId: string) => {
  const { data, isLoading } = useGuildBoardsQuery(guildId);

  return { boards: data ?? EMPTY_BOARDS, isLoading };
};
