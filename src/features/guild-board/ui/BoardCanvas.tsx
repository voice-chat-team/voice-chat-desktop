import "@excalidraw/excalidraw/index.css";

import { Excalidraw, restore } from "@excalidraw/excalidraw";
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
} from "@excalidraw/excalidraw/types";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { BoardOps } from "@/entities/board";
import type { BoardSaveStatus, BoardSceneDto } from "@/shared";

import {
  useBoardPresence,
  useBoardSync,
  type BoardMemberProfile,
} from "../hooks";

type BoardCanvasProps = {
  boardId: string;
  boardName: string;
  initialScene: BoardSceneDto;
  applyOps: (ops: BoardOps) => Promise<{ seq: number }>;
  fetchScene: () => Promise<BoardSceneDto>;
  getBoardToken: () => Promise<string>;
  getPresenceToken: () => Promise<string>;
  currentUserId?: string;
  resolveMember: (userId: string) => BoardMemberProfile | undefined;
  onStatusChange: (status: BoardSaveStatus) => void;
};

/**
 * Точка входа в ленивый чанк с Excalidraw. Рантайм-значения из пакета
 * разрешено импортировать только отсюда и из хуков useBoardSync /
 * useBoardPresence (которые подключает лишь этот файл) — всё остальное
 * приложение обязано использовать `import type`, иначе многомегабайтный
 * чанк уедет в основной бандл.
 */
export const BoardCanvas = ({
  boardId,
  boardName,
  initialScene,
  applyOps,
  fetchScene,
  getBoardToken,
  getPresenceToken,
  currentUserId,
  resolveMember,
  onStatusChange,
}: BoardCanvasProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  const { handleChange } = useBoardSync({
    boardId,
    initialScene,
    apiRef,
    applyOps,
    fetchScene,
    getBoardToken,
    onStatusChange,
  });

  const { handlePointerUpdate } = useBoardPresence({
    boardId,
    apiRef,
    getPresenceToken,
    currentUserId,
    resolveMember,
  });

  const initialData = useMemo(
    () => ({
      ...restore(
        {
          elements: initialScene.elements,
          appState: initialScene.appState,
        },
        null,
        null,
      ),
      scrollToContent: true,
    }),
    [initialScene],
  );

  useEffect(() => {
    const element = wrapperRef.current;
    if (!element) return;

    const observer = new ResizeObserver(() => apiRef.current?.refresh());
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const handleApi = useCallback((api: ExcalidrawImperativeAPI) => {
    apiRef.current = api;
  }, []);

  const handleLinkOpen = useCallback<
    NonNullable<ExcalidrawProps["onLinkOpen"]>
  >((element, event) => {
    event.preventDefault();

    if (!element.link) return;

    openUrl(element.link).catch((error) =>
      console.error("[board] не удалось открыть ссылку", error),
    );
  }, []);

  // Картинки на общих досках пока не синхронизируются, поэтому и вставить
  // их не даём: у остальных участников они были бы пустыми рамками.
  const handlePaste = useCallback<NonNullable<ExcalidrawProps["onPaste"]>>(
    (data, event) => {
      const hasFiles =
        Object.keys(data.files ?? {}).length > 0 ||
        (event?.clipboardData?.files.length ?? 0) > 0;

      return !hasFiles;
    },
    [],
  );

  return (
    <div ref={wrapperRef} className="h-full w-full">
      <Excalidraw
        excalidrawAPI={handleApi}
        initialData={initialData}
        onChange={handleChange}
        onPointerUpdate={handlePointerUpdate}
        onPaste={handlePaste}
        isCollaborating
        theme="dark"
        langCode="ru-RU"
        name={boardName}
        handleKeyboardGlobally={false}
        validateEmbeddable={false}
        onLinkOpen={handleLinkOpen}
        gridModeEnabled
        UIOptions={{
          canvasActions: {
            loadScene: false,
            saveToActiveFile: false,
            saveAsImage: false,
            export: false,
            toggleTheme: false,
            clearCanvas: true,
            changeViewBackgroundColor: true,
          },
          tools: { image: false },
        }}
      />
    </div>
  );
};
