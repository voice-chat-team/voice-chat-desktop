import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";
import {
  SHARED_APP_STATE_KEYS,
  type BoardAppState,
  type BoardSceneDto,
} from "@/shared";

/**
 * Приводит состояние Excalidraw к снимку, для сохранения в store
 */
export const toBoardScene = (
  elements: readonly ExcalidrawElement[],
  appState: AppState,
  files: BinaryFiles,
): BoardSceneDto => ({
  elements,
  appState: Object.fromEntries(
    SHARED_APP_STATE_KEYS.map((key) => [key, appState[key]]),
  ) as BoardAppState,
  files,
});
