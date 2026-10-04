import type { AppState } from "@excalidraw/excalidraw/types";
import type { ExcalidrawElement } from "@excalidraw/excalidraw/element/types";

// BoardDto приходит из ./generated вместе с остальным клиентом BoardApi.

/**
 * Свойства appState, относящиеся к самой доске, а не к конкретному зрителю.
 * Тот же список держит у себя сервис досок — остальное он отбрасывает.
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

/**
 * Снимок сцены доски с сервера. В elements лежат и удалённые элементы
 * (isDeleted) — без них слияние не узнало бы об удалениях.
 */
export interface BoardSceneDto {
  elements: readonly ExcalidrawElement[];
  appState: BoardAppState;
  /** Номер последней применённой сервером пачки правок. */
  seq: number;
}

/** Событие канала board:{boardId}. */
export type BoardElementsUpdatedEvent = {
  type: "BOARD_ELEMENTS_UPDATED";
  payload: {
    boardId: string;
    clientId: string;
    seq: number;
    elements: ExcalidrawElement[];
    appState?: BoardAppState;
  };
};

/** Сообщение, которое клиенты сами публикуют в board-presence:{boardId}. */
export type BoardPointerEvent = {
  type: "POINTER";
  clientId: string;
  pointer: { x: number; y: number; tool: "pointer" | "laser" };
  button: "up" | "down";
  selectedElementIds: Record<string, true>;
};

export type BoardSaveStatus = "idle" | "pending" | "saved" | "error";
