import { useGuildBoardsQuery, type BoardDto } from "@/shared";

const EMPTY_BOARDS: BoardDto[] = [];

export const useGuildBoards = (guildId: string) => {
  const { data, isLoading } = useGuildBoardsQuery(guildId);

  return { boards: data ?? EMPTY_BOARDS, isLoading };
};
