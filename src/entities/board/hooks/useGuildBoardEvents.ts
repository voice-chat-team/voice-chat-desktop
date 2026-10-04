import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  guildBoardsQueryKey,
  removeGuildBoard,
  upsertGuildBoard,
  type BoardDto,
} from "@/shared";
import { useCentrifuge } from "@/shared/lib";

type GuildBoardEvent =
  | { type: "BOARD_CREATED" | "BOARD_UPDATED"; payload?: { board?: BoardDto } }
  | { type: "BOARD_DELETED"; payload?: { boardId?: string; guildId?: string } };

type GuildBoardEventHandlers = {
  /** Доску переименовали — открытая копия BoardDto должна обновиться. */
  onBoardUpdated?: (board: BoardDto) => void;
  /** Доску удалили — если она открыта, её нужно закрыть. */
  onBoardDeleted?: (boardId: string) => void;
};

/**
 * События списка досок в общем канале guild:{guildId}. Там же ходят события
 * участников и голоса с другой формой payload, поэтому сначала смотрим на type.
 */
export const useGuildBoardEvents = (
  guildId: string,
  handlers: GuildBoardEventHandlers = {},
) => {
  const queryClient = useQueryClient();
  const centrifuge = useCentrifuge();

  // Обработчики через ref, чтобы новые колбэки на каждый рендер
  // не пересоздавали подписку.
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!centrifuge) return;

    const channel = `guild:${guildId}`;

    const sub =
      centrifuge.getSubscription(channel) ??
      centrifuge.newSubscription(channel);

    let isFirstSubscribe = true;

    const handlePublication = (ctx: { data?: unknown }) => {
      const event = (ctx.data ?? {}) as Partial<GuildBoardEvent>;

      if (event.type === "BOARD_CREATED" || event.type === "BOARD_UPDATED") {
        const board = event.payload?.board;
        if (!board || board.guildId !== guildId) return;

        upsertGuildBoard(queryClient, board);
        handlersRef.current.onBoardUpdated?.(board);
        return;
      }

      if (event.type === "BOARD_DELETED") {
        const boardId = event.payload?.boardId;
        if (!boardId || event.payload?.guildId !== guildId) return;

        removeGuildBoard(queryClient, guildId, boardId);
        handlersRef.current.onBoardDeleted?.(boardId);
      }
    };

    const handleSubscribed = () => {
      // За время разрыва могли пропустить события — перечитываем список.
      if (!isFirstSubscribe) {
        void queryClient.invalidateQueries({
          queryKey: guildBoardsQueryKey(guildId),
        });
      }

      isFirstSubscribe = false;
    };

    sub.on("publication", handlePublication);
    sub.on("subscribed", handleSubscribed);

    sub.subscribe();

    // Снимаем только свои обработчики: на этот же канал подписаны
    // useGuildChannelEvents и useGuildVoiceEvents.
    return () => {
      sub.off("publication", handlePublication);
      sub.off("subscribed", handleSubscribed);
      sub.unsubscribe();
    };
  }, [centrifuge, guildId, queryClient]);
};
