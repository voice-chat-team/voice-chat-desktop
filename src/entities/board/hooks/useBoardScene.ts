import { useCallback } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  boardApi,
  type BoardAppState,
  type BoardDto,
  type BoardSceneDto,
} from "@/shared";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

export const boardSceneQueryKey = (boardId: string) => ["board-scene", boardId];

export type BoardOps = {
  clientId: string;
  elements: readonly ExcalidrawElement[];
  appState?: BoardAppState;
};

const fetchBoardScene = async (
  board: Pick<BoardDto, "id" | "guildId">,
  signal?: AbortSignal,
): Promise<BoardSceneDto> => {
  const { data } = await boardApi.boardControllerGetBoardScene(
    board.id,
    board.guildId,
    { signal },
  );

  return {
    elements: (data.elements ?? []) as unknown as ExcalidrawElement[],
    appState: (data.appState ?? {}) as BoardAppState,
    seq: data.seq ?? 0,
  };
};

/**
 * Сцена доски и операции над ней.
 */
export const useBoardScene = (board: Pick<BoardDto, "id" | "guildId">) => {
  const { id: boardId, guildId } = board;

  const { data: scene } = useSuspenseQuery({
    queryKey: boardSceneQueryKey(boardId),
    queryFn: ({ signal }) => fetchBoardScene({ id: boardId, guildId }, signal),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  /** Свежая сцена в обход кэша — для догонки после пропущенных событий. */
  const fetchScene = useCallback(
    () => fetchBoardScene({ id: boardId, guildId }),
    [boardId, guildId],
  );

  const applyOps = useCallback(
    async ({ clientId, elements, appState }: BoardOps) => {
      const { data } = await boardApi.boardControllerApplyBoardOps({
        boardId,
        guildId,
        clientId,
        elements: elements as unknown as Array<Record<string, unknown>>,
        appState,
      });

      return data;
    },
    [boardId, guildId],
  );

  const fetchSubscriptionTokens = useCallback(async () => {
    const { data } = await boardApi.boardControllerGetBoardSubscriptionToken(
      boardId,
      guildId,
    );

    return data;
  }, [boardId, guildId]);

  return { scene, fetchScene, applyOps, fetchSubscriptionTokens };
};
