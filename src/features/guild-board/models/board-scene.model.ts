import type { AppState } from "@excalidraw/excalidraw/types";
import { SHARED_APP_STATE_KEYS, type BoardAppState } from "@/shared";

/**
 * Идентификатор вкладки для канала доски: по нему клиент узнаёт эхо своих
 * правок и курсора. Один на вкладку — одновременно открыта одна доска.
 */
export const BOARD_CLIENT_ID = crypto.randomUUID();

/** Только общие для всех зрителей свойства appState — их и синхронизируем. */
export const pickSharedAppState = (
  appState: Partial<AppState>,
): BoardAppState =>
  Object.fromEntries(
    SHARED_APP_STATE_KEYS.filter((key) => appState[key] !== undefined).map(
      (key) => [key, appState[key]],
    ),
  ) as BoardAppState;
