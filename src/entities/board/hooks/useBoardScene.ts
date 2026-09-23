import { useCallback } from "react";
import type { BoardSceneDto } from "@/shared";

import { useBoardStore } from "../store";

/**
 * Снимок сцены доски и функция его сохранения.
 *
 * Стык под бэкенд: `scene` станет `useSuspenseQuery`, `saveScene` — `useMutation`
 * с write-through в кэш TanStack Query. Компоненты доски об источнике данных
 * не знают и при переезде не меняются.
 */
export const useBoardScene = (boardId: string) => {
  const scene = useBoardStore(
    (store) => store.state.scenesByBoard[boardId] ?? null,
  );
  const persistScene = useBoardStore((store) => store.actions.saveScene);

  const saveScene = useCallback(
    (next: BoardSceneDto) => persistScene(boardId, next),
    [boardId, persistScene],
  );

  return { scene, isLoading: false, saveScene };
};
