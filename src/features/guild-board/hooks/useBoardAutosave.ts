import { useCallback, useEffect, useRef } from "react";
import { hashElementsVersion } from "@excalidraw/excalidraw";
import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import type { OrderedExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import type { BoardSaveStatus, BoardSceneDto } from "@/shared";

import { toBoardScene } from "../models";

/** Сохраняем через секунду после того, как пользователь перестал рисовать... */
const DEBOUNCE_MS = 1000;
/** ...но не реже раза в пять секунд, если он рисует без остановки. */
const MAX_WAIT_MS = 5000;

type UseBoardAutosaveParams = {
  saveScene: (scene: BoardSceneDto) => void;
  onStatusChange: (status: BoardSaveStatus) => void;
};

/**
 * Автосейв доски: гасит лишние onChange, копит правки и сбрасывает их
 * по debounce, а на размонтировании и закрытии окна дописывает хвост.
 */
export const useBoardAutosave = ({
  saveScene,
  onStatusChange,
}: UseBoardAutosaveParams) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<BoardSceneDto | null>(null);
  const lastHashRef = useRef<number | null>(null);
  const lastAppStateRef = useRef<string | null>(null);

  const flush = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    if (maxWaitRef.current) {
      clearTimeout(maxWaitRef.current);
      maxWaitRef.current = null;
    }

    const pending = pendingRef.current;
    if (!pending) return;

    pendingRef.current = null;
    saveScene(pending);
    onStatusChange("saved");
  }, [saveScene, onStatusChange]);

  const handleChange = useCallback(
    (
      elements: readonly OrderedExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles,
    ) => {
      const scene = toBoardScene(elements, appState, files);
      const hash = hashElementsVersion(elements);
      const appStateSnapshot = JSON.stringify(scene.appState);

      const isFirstChange = lastHashRef.current === null;
      const isUnchanged =
        hash === lastHashRef.current &&
        appStateSnapshot === lastAppStateRef.current;

      lastHashRef.current = hash;
      lastAppStateRef.current = appStateSnapshot;

      // Первый onChange прилетает сразу после монтирования, из initialData —
      // это ещё не правка
      if (isFirstChange || isUnchanged) return;

      pendingRef.current = scene;
      onStatusChange("pending");

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(flush, DEBOUNCE_MS);

      // Потолок ожидания взводим один раз на серию правок и не сбрасываем,
      // иначе непрерывное рисование откладывало бы сохранение бесконечно.
      if (!maxWaitRef.current) {
        maxWaitRef.current = setTimeout(flush, MAX_WAIT_MS);
      }
    },
    [flush, onStatusChange],
  );

  useEffect(() => {
    window.addEventListener("beforeunload", flush);

    return () => {
      window.removeEventListener("beforeunload", flush);
      flush();
    };
  }, [flush]);

  return { handleChange };
};
