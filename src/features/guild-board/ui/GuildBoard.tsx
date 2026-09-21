import { lazy, Suspense, useRef, useState } from "react";
import {
  ErrorBoundary,
  Separator,
  setExcalidrawAssetPath,
  type BoardDto,
  type BoardSaveStatus,
} from "@/shared";
import { useBoardScene } from "@/entities/board";

import { GuildBoardHeader } from "./GuildBoardHeader";
import { BoardCanvasSkeleton } from "./BoardCanvasSkeleton";

const BoardCanvas = lazy(async () => {
  setExcalidrawAssetPath();

  const { BoardCanvas } = await import("./BoardCanvas");

  return { default: BoardCanvas };
});

type GuildBoardProps = {
  board: BoardDto;
};

export const GuildBoard = ({ board }: GuildBoardProps) => {
  const [status, setStatus] = useState<BoardSaveStatus>("idle");
  const { scene, saveScene } = useBoardScene(board.id);

  const initialSceneRef = useRef(scene);

  return (
    <div className="flex flex-col h-full">
      <GuildBoardHeader name={board.name} status={status} />

      <Separator />

      <div className="flex-1 min-h-0">
        <ErrorBoundary
          fallback={
            <p className="p-4 text-sm text-accent">
              Не удалось загрузить доску
            </p>
          }
        >
          <Suspense fallback={<BoardCanvasSkeleton />}>
            <BoardCanvas
              boardName={board.name}
              initialScene={initialSceneRef.current}
              saveScene={saveScene}
              onStatusChange={setStatus}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};
