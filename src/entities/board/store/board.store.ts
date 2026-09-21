import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { BoardDto, BoardSceneDto } from "@/shared";

type BoardState = {
  state: {
    boardsByGuild: Record<string, BoardDto[]>;
    scenesByBoard: Record<string, BoardSceneDto>;
  };
  actions: {
    createBoard: (guildId: string, name: string) => BoardDto;
    saveScene: (boardId: string, scene: BoardSceneDto) => void;
  };
};

const initialState: BoardState["state"] = {
  boardsByGuild: {},
  scenesByBoard: {},
};

/**
 * Снимок сцены может быть тяжёлым (картинки лежат в files как data-URL),
 * поэтому переполнение квоты localStorage не должно ронять приложение:
 * рисовать можно дальше, просто рисунок не переживёт перезапуск.
 */
const safeStorage: Storage = {
  get length() {
    return localStorage.length;
  },
  key: (index) => localStorage.key(index),
  clear: () => localStorage.clear(),
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      console.warn(
        "[board-store] не удалось сохранить доски в localStorage — вероятно, превышена квота",
      );
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* noop */
    }
  },
};

/**
 * Временное хранилище досок на время, пока нет сервиса досок. Когда он появится,
 * этот стор удаляется, а хуки `useGuildBoards` / `useBoardScene` переезжают на
 * сгенерированный API-клиент — компоненты доски при этом не меняются.
 */
export const useBoardStore = create<BoardState>()(
  persist(
    (set) => ({
      state: { ...initialState },
      actions: {
        createBoard: (guildId, name) => {
          const board: BoardDto = {
            id: crypto.randomUUID(),
            guildId,
            name,
            createdAt: new Date().toISOString(),
          };

          set((prev) => ({
            state: {
              ...prev.state,
              boardsByGuild: {
                ...prev.state.boardsByGuild,
                [guildId]: [...(prev.state.boardsByGuild[guildId] ?? []), board],
              },
            },
          }));

          return board;
        },
        saveScene: (boardId, scene) =>
          set((prev) => ({
            state: {
              ...prev.state,
              scenesByBoard: { ...prev.state.scenesByBoard, [boardId]: scene },
            },
          })),
      },
    }),
    {
      name: "voice-chat:boards",
      storage: createJSONStorage(() => safeStorage),
      partialize: (store) => ({ state: store.state }) as BoardState,
    },
  ),
);
