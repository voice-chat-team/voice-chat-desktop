import { useCallback, useEffect, useRef, type RefObject } from "react";
import type {
  Collaborator,
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
  SocketId,
} from "@excalidraw/excalidraw/types";
import type {
  ClientInfo,
  JoinContext,
  LeaveContext,
  PublicationContext,
  Subscription,
} from "centrifuge";
import type { BoardPointerEvent } from "@/shared";
import { useCentrifuge } from "@/shared/lib";

import { BOARD_CLIENT_ID, getCollaboratorColor } from "../models";

/** ~20 обновлений курсора в секунду — плавно и не забивает канал. */
const POINTER_THROTTLE_MS = 50;
/** Курсор, который давно не двигался, Excalidraw рисует как «неактивный». */
const IDLE_AFTER_MS = 30_000;
const IDLE_SWEEP_MS = 5_000;

type PointerUpdate = Parameters<
  NonNullable<ExcalidrawProps["onPointerUpdate"]>
>[0];

export type BoardMemberProfile = {
  username: string;
  avatarUrl?: string;
};

type RemoteCollaborator = {
  userId: string;
  pointer?: BoardPointerEvent["pointer"];
  button?: BoardPointerEvent["button"];
  selectedElementIds?: BoardPointerEvent["selectedElementIds"];
  lastActiveAt: number;
};

type UseBoardPresenceParams = {
  boardId: string;
  apiRef: RefObject<ExcalidrawImperativeAPI | null>;
  getPresenceToken: () => Promise<string>;
  currentUserId?: string;
  resolveMember: (userId: string) => BoardMemberProfile | undefined;
};

/**
 * Курсоры и состав участников доски через канал board-presence:{boardId}.
 */
export const useBoardPresence = ({
  boardId,
  apiRef,
  getPresenceToken,
  currentUserId,
  resolveMember,
}: UseBoardPresenceParams) => {
  const centrifuge = useCentrifuge();

  const subRef = useRef<Subscription | null>(null);
  const collaboratorsRef = useRef(new Map<string, RemoteCollaborator>());
  const frameRef = useRef<number | null>(null);

  const pendingPointerRef = useRef<PointerUpdate | null>(null);
  const pointerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const latestRef = useRef({ getPresenceToken, currentUserId, resolveMember });
  latestRef.current = { getPresenceToken, currentUserId, resolveMember };

  /** Перерисовка курсоров не чаще раза за кадр, сколько бы событий ни пришло. */
  const scheduleRender = useCallback(() => {
    if (frameRef.current !== null) return;

    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;

      const api = apiRef.current;
      if (!api) return;

      const { currentUserId, resolveMember } = latestRef.current;
      const now = Date.now();
      const collaborators = new Map<SocketId, Collaborator>();

      for (const [clientKey, remote] of collaboratorsRef.current) {
        // Своё же подключение приходит в presence и join, но курсора у него
        // нет (свои публикации мы отбрасываем) — в списке оно лишнее.
        if (remote.userId === currentUserId && !remote.pointer) continue;

        const profile = resolveMember(remote.userId);
        const socketId = clientKey as SocketId;

        collaborators.set(socketId, {
          id: remote.userId,
          socketId,
          username: profile?.username ?? "Участник",
          avatarUrl: profile?.avatarUrl,
          color: getCollaboratorColor(remote.userId),
          pointer: remote.pointer,
          button: remote.button,
          selectedElementIds: remote.selectedElementIds,
          userState: (now - remote.lastActiveAt > IDLE_AFTER_MS
            ? "idle"
            : "active") as Collaborator["userState"],
        });
      }

      api.updateScene({ collaborators });
    });
  }, [apiRef]);

  const addPresent = useCallback(
    (info: ClientInfo) => {
      if (collaboratorsRef.current.has(info.client)) return;

      collaboratorsRef.current.set(info.client, {
        userId: info.user,
        lastActiveAt: Date.now(),
      });
      scheduleRender();
    },
    [scheduleRender],
  );

  useEffect(() => {
    const channel = `board-presence:${boardId}`;
    const collaborators = collaboratorsRef.current;

    const stale = centrifuge.getSubscription(channel);
    if (stale) centrifuge.removeSubscription(stale);

    const sub = centrifuge.newSubscription(channel, {
      getToken: () => latestRef.current.getPresenceToken(),
    });
    subRef.current = sub;

    const handlePublication = (ctx: PublicationContext) => {
      const event = ctx.data as Partial<BoardPointerEvent> | undefined;
      if (event?.type !== "POINTER" || !ctx.info) return;
      if (event.clientId === BOARD_CLIENT_ID) return;

      collaborators.set(ctx.info.client, {
        userId: ctx.info.user,
        pointer: event.pointer,
        button: event.button,
        selectedElementIds: event.selectedElementIds,
        lastActiveAt: Date.now(),
      });
      scheduleRender();
    };

    const handleJoin = (ctx: JoinContext) => addPresent(ctx.info);

    const handleLeave = (ctx: LeaveContext) => {
      if (collaborators.delete(ctx.info.client)) scheduleRender();
    };

    const handleSubscribed = async () => {
      // После (пере)подключения состав берём заново: join/leave за время
      // разрыва потеряны.
      collaborators.clear();

      try {
        const { clients } = await sub.presence();
        Object.values(clients).forEach(addPresent);
      } catch (error) {
        console.error("[board] не удалось получить участников доски", error);
      }

      scheduleRender();
    };

    sub.on("publication", handlePublication);
    sub.on("join", handleJoin);
    sub.on("leave", handleLeave);
    sub.on("subscribed", handleSubscribed);

    sub.subscribe();

    // Неподвижные курсоры переводим в «неактивные» — Excalidraw их приглушает.
    const idleTimer = setInterval(() => {
      if (collaborators.size > 0) scheduleRender();
    }, IDLE_SWEEP_MS);

    return () => {
      clearInterval(idleTimer);
      if (pointerTimerRef.current) {
        clearTimeout(pointerTimerRef.current);
        pointerTimerRef.current = null;
      }
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      sub.removeAllListeners();
      centrifuge.removeSubscription(sub);
      subRef.current = null;
      collaborators.clear();
    };
  }, [centrifuge, boardId, addPresent, scheduleRender]);

  const publishPointer = useCallback(() => {
    pointerTimerRef.current = null;

    const update = pendingPointerRef.current;
    const sub = subRef.current;
    if (!update || !sub || sub.state !== "subscribed") return;

    pendingPointerRef.current = null;

    const event: BoardPointerEvent = {
      type: "POINTER",
      clientId: BOARD_CLIENT_ID,
      pointer: update.pointer,
      button: update.button,
      selectedElementIds: (apiRef.current?.getAppState().selectedElementIds ??
        {}) as BoardPointerEvent["selectedElementIds"],
    };

    sub.publish(event).catch(() => {});
  }, [apiRef]);

  const handlePointerUpdate = useCallback(
    (update: PointerUpdate) => {
      pendingPointerRef.current = update;

      if (!pointerTimerRef.current) {
        pointerTimerRef.current = setTimeout(
          publishPointer,
          POINTER_THROTTLE_MS,
        );
      }
    },
    [publishPointer],
  );

  return { handlePointerUpdate };
};
