import type { AppState, BinaryFiles } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

/**
 * Форма повторяет сгенерированные модели (ChannelDto, GuildDto), чтобы при
 * появлении сервиса досок этот файл просто заменился реэкспортом из
 * `./generated`, а вышележащий код не поменялся.
 */
export interface BoardDto {
  id: string;
  guildId: string;
  name: string;
  createdAt: string;
}

/**
 * Свойства appState, относящиеся к самой доске, а не к конкретному зрителю.
 *
 * gridModeEnabled здесь сознательно нет: режим сетки задаётся пропом
 * в BoardCanvas и полностью перекрывает appState, так что сохранённое
 * значение ни на что не влияло бы — и «выстрелило» бы выключенной сеткой
 * на всех уже существующих досках, если проп когда-нибудь уберут.
 */
export const SHARED_APP_STATE_KEYS = [
  "viewBackgroundColor",
  "gridSize",
  "gridStep",
] as const satisfies readonly (keyof AppState)[];

export type BoardAppState = Partial<
  Pick<AppState, (typeof SHARED_APP_STATE_KEYS)[number]>
>;

/** Снимок сцены доски — то, что уедет на бэкенд одним JSON-документом. */
export interface BoardSceneDto {
  elements: readonly ExcalidrawElement[];
  appState: BoardAppState;
  files: BinaryFiles;
}

export type BoardSaveStatus = "idle" | "pending" | "saved";
