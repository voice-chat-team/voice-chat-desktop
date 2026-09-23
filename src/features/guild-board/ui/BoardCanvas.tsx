import "@excalidraw/excalidraw/index.css";

import { Excalidraw, restore } from "@excalidraw/excalidraw";
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
} from "@excalidraw/excalidraw/types";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { BoardSaveStatus, BoardSceneDto } from "@/shared";

import { useBoardAutosave } from "../hooks";

type BoardCanvasProps = {
  boardName: string;
  initialScene: BoardSceneDto | null;
  saveScene: (scene: BoardSceneDto) => void;
  onStatusChange: (status: BoardSaveStatus) => void;
};

/**
 * Точка входа в ленивый чанк с Excalidraw. Рантайм-значения из пакета
 * разрешено импортировать только отсюда и из useBoardAutosave (который
 * подключается лишь этим файлом) — всё остальное приложение обязано
 * использовать `import type`, иначе многомегабайтный чанк уедет
 * в основной бандл.
 */
export const BoardCanvas = ({
  boardName,
  initialScene,
  saveScene,
  onStatusChange,
}: BoardCanvasProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  const { handleChange } = useBoardAutosave({ saveScene, onStatusChange });

  const initialData = useMemo(
    () => ({
      ...restore(
        {
          elements: initialScene?.elements ?? [],
          appState: initialScene?.appState ?? {},
          files: initialScene?.files ?? {},
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

  return (
    <div ref={wrapperRef} className="h-full w-full">
      <Excalidraw
        excalidrawAPI={handleApi}
        initialData={initialData}
        onChange={handleChange}
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
        }}
      />
    </div>
  );
};
