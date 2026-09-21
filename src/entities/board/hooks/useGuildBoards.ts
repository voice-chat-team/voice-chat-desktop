import type { BoardDto } from "@/shared";
import { useBoardStore } from "../store";

/**
 * Стабильная ссылка: zustand v5 сравнивает результат селектора через Object.is,
 * поэтому новый пустой массив на каждый рендер уводил бы компонент в цикл.
 */
const EMPTY_BOARDS: BoardDto[] = [];

/**
 * Список досок гильдии.
 *
 * Стык под бэкенд: когда появится сервис досок, тело заменяется на
 * `useSuspenseQuery` над сгенерированным клиентом, сигнатура остаётся прежней.
 */
export const useGuildBoards = (guildId: string) => {
  const boards = useBoardStore(
    (store) => store.state.boardsByGuild[guildId] ?? EMPTY_BOARDS,
  );

  return { boards, isLoading: false };
};
