import { lazy, Suspense, useCallback, useMemo, useRef, useState } from "react";
import {
  ErrorBoundary,
  Separator,
  setExcalidrawAssetPath,
  useCurrentUser,
  useGuildMembers,
  type BoardDto,
  type BoardSaveStatus,
} from "@/shared";
import { useBoardScene } from "@/entities/board";

import type { BoardMemberProfile } from "../hooks";
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
            <GuildBoardContent board={board} onStatusChange={setStatus} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
};

type GuildBoardContentProps = {
  board: BoardDto;
  onStatusChange: (status: BoardSaveStatus) => void;
};

/** Отдельный компонент, чтобы загрузка сцены показывала скелетон под заголовком. */
const GuildBoardContent = ({ board, onStatusChange }: GuildBoardContentProps) => {
  const { scene, fetchScene, applyOps, fetchSubscriptionTokens } =
    useBoardScene(board);
  const { data: currentUser } = useCurrentUser();
  const { data: members } = useGuildMembers(board.guildId);

  // Снимок нужен только для первой отрисовки: дальше сцена живёт в Excalidraw,
  // и подмена initialData перемонтировала бы холст.
  const initialSceneRef = useRef(scene);

  const profiles = useMemo(
    () =>
      new Map<string, BoardMemberProfile>(
        members.map((member) => [
          member.userId,
          {
            username: member.user?.username ?? "Участник",
            avatarUrl: member.user?.avatarUrl || undefined,
          },
        ]),
      ),
    [members],
  );

  const resolveMember = useCallback(
    (userId: string) => profiles.get(userId),
    [profiles],
  );

  const getBoardToken = useCallback(
    async () => (await fetchSubscriptionTokens()).boardToken,
    [fetchSubscriptionTokens],
  );

  const getPresenceToken = useCallback(
    async () => (await fetchSubscriptionTokens()).presenceToken,
    [fetchSubscriptionTokens],
  );

  return (
    <BoardCanvas
      boardId={board.id}
      boardName={board.name}
      initialScene={initialSceneRef.current}
      applyOps={applyOps}
      fetchScene={fetchScene}
      getBoardToken={getBoardToken}
      getPresenceToken={getPresenceToken}
      currentUserId={currentUser?.id}
      resolveMember={resolveMember}
      onStatusChange={onStatusChange}
    />
  );
};
