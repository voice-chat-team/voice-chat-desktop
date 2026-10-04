import { useCallback, useEffect, useRef, type RefObject } from "react";
import {
  CaptureUpdateAction,
  hashElementsVersion,
  reconcileElements,
  restoreElements,
} from "@excalidraw/excalidraw";
import type {
  AppState,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";
import type {
  ExcalidrawElement,
  OrderedExcalidrawElement,
} from "@excalidraw/excalidraw/element/types";
import type { PublicationContext, SubscribedContext } from "centrifuge";
import type { BoardOps } from "@/entities/board";
import type {
  BoardAppState,
  BoardElementsUpdatedEvent,
  BoardSaveStatus,
  BoardSceneDto,
} from "@/shared";
import { useCentrifuge } from "@/shared/lib";

import { BOARD_CLIENT_ID, pickSharedAppState } from "../models";

/** Копим правки и отправляем пачкой не чаще, чем раз в это время. */
const SEND_THROTTLE_MS = 150;
/** Пауза перед повтором, если сервер недоступен. */
const RETRY_DELAY_MS = 2000;
/** Сервер принимает до 500 элементов и ~256 КБ за раз — держимся с запасом. */
const MAX_ELEMENTS_PER_BATCH = 200;
const MAX_BATCH_CHARS = 200_000;

type RemoteElements = Parameters<typeof reconcileElements>[1];

type UseBoardSyncParams = {
  boardId: string;
  initialScene: BoardSceneDto;
  apiRef: RefObject<ExcalidrawImperativeAPI | null>;
  applyOps: (ops: BoardOps) => Promise<{ seq: number }>;
  fetchScene: () => Promise<BoardSceneDto>;
  getBoardToken: () => Promise<string>;
  onStatusChange: (status: BoardSaveStatus) => void;
};

/**
 * Синхронизация сцены доски между участниками.
 *
 * Свои правки: onChange сравнивает версии элементов с теми, что уже известны
 * серверу, и копит изменённые; пачка уходит в POST /board/scene не чаще раза
 * в SEND_THROTTLE_MS, запросы идут строго по одному.
 *
 * Чужие правки: приходят в канал board:{boardId} и сливаются с локальной
 * сценой через reconcileElements — по тому же правилу (version, затем
 * versionNonce), что и на сервере, поэтому все клиенты сходятся к одной сцене.
 */
export const useBoardSync = ({
  boardId,
  initialScene,
  apiRef,
  applyOps,
  fetchScene,
  getBoardToken,
  onStatusChange,
}: UseBoardSyncParams) => {
  const centrifuge = useCentrifuge();

  /** Версия каждого элемента, которую сервер уже знает (или скоро узнает). */
  const syncedVersionsRef = useRef<Map<string, number>>(null);
  if (!syncedVersionsRef.current) {
    syncedVersionsRef.current = new Map(
      initialScene.elements.map((element) => [element.id, element.version]),
    );
  }

  const pendingElementsRef = useRef(new Map<string, ExcalidrawElement>());
  const pendingAppStateRef = useRef<BoardAppState | null>(null);

  const lastHashRef = useRef<number | null>(null);
  const lastAppStateRef = useRef<string | null>(null);
  const lastSeqRef = useRef(initialScene.seq);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const disposedRef = useRef(false);

  // Колбэки читаем через ref: подписка и таймеры не должны пересоздаваться
  // из-за новых функций на каждый рендер.
  const latestRef = useRef({ applyOps, fetchScene, getBoardToken, onStatusChange });
  latestRef.current = { applyOps, fetchScene, getBoardToken, onStatusChange };

  const sendRef = useRef<() => Promise<void>>(async () => {});

  const hasPending = () =>
    pendingElementsRef.current.size > 0 || pendingAppStateRef.current !== null;

  const scheduleSend = useCallback((delay = SEND_THROTTLE_MS) => {
    if (timerRef.current) return;

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void sendRef.current();
    }, delay);
  }, []);

  const takeBatch = () => {
    const pending = pendingElementsRef.current;
    const batch: ExcalidrawElement[] = [];
    let chars = 0;

    for (const [id, element] of pending) {
      const size = JSON.stringify(element).length;

      if (
        batch.length > 0 &&
        (batch.length >= MAX_ELEMENTS_PER_BATCH || chars + size > MAX_BATCH_CHARS)
      ) {
        break;
      }

      batch.push(element);
      chars += size;
      pending.delete(id);
    }

    return batch;
  };

  sendRef.current = async () => {
    if (inFlightRef.current || !hasPending()) return;

    inFlightRef.current = true;

    const elements = takeBatch();
    const appState = pendingAppStateRef.current ?? undefined;
    pendingAppStateRef.current = null;

    let failed = false;

    try {
      const { seq } = await latestRef.current.applyOps({
        clientId: BOARD_CLIENT_ID,
        elements,
        appState,
      });

      lastSeqRef.current = Math.max(lastSeqRef.current, seq);
    } catch (error) {
      failed = true;
      console.error("[board] не удалось отправить изменения доски", error);

      // Возвращаем пачку в очередь, если за время запроса элемент
      // не успели поменять ещё раз — тогда в очереди уже более свежая версия.
      const pending = pendingElementsRef.current;
      for (const element of elements) {
        const queued = pending.get(element.id);
        if (!queued || queued.version < element.version) {
          pending.set(element.id, element);
        }
      }
      if (appState && !pendingAppStateRef.current) {
        pendingAppStateRef.current = appState;
      }
    } finally {
      inFlightRef.current = false;
    }

    if (failed) {
      if (!disposedRef.current) {
        latestRef.current.onStatusChange("error");
        scheduleSend(RETRY_DELAY_MS);
      }
      return;
    }

    if (hasPending()) {
      scheduleSend(0);
    } else if (!disposedRef.current) {
      latestRef.current.onStatusChange("saved");
    }
  };

  /** Отправить накопленное прямо сейчас — при уходе со страницы или доски. */
  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    void sendRef.current();
  }, []);

  const handleChange = useCallback(
    (elements: readonly OrderedExcalidrawElement[], appState: AppState) => {
      const hash = hashElementsVersion(elements);
      const sharedAppState = pickSharedAppState(appState);
      const appStateSnapshot = JSON.stringify(sharedAppState);

      // Первый onChange прилетает из initialData — для appState это точка
      // отсчёта, а не правка. Элементы отсеет сравнение версий.
      const isFirstChange = lastAppStateRef.current === null;

      if (
        hash === lastHashRef.current &&
        appStateSnapshot === lastAppStateRef.current
      ) {
        return;
      }

      let changed = false;

      if (!isFirstChange && appStateSnapshot !== lastAppStateRef.current) {
        pendingAppStateRef.current = sharedAppState;
        changed = true;
      }

      lastHashRef.current = hash;
      lastAppStateRef.current = appStateSnapshot;

      const syncedVersions = syncedVersionsRef.current!;
      const pending = pendingElementsRef.current;

      // В onChange приходят и удалённые элементы (isDeleted) — так удаление
      // и доезжает до сервера как обычная новая версия элемента.
      for (const element of elements) {
        // Картинки в первой версии не синхронизируются: без файлов
        // у остальных участников они были бы пустыми рамками.
        if (element.type === "image") continue;

        if (element.version > (syncedVersions.get(element.id) ?? -1)) {
          pending.set(element.id, element);
          syncedVersions.set(element.id, element.version);
          changed = true;
        }
      }

      if (!changed) return;

      latestRef.current.onStatusChange("pending");
      scheduleSend();
    },
    [scheduleSend],
  );

  const applyRemote = useCallback(
    (remoteElements: readonly ExcalidrawElement[], remoteAppState?: BoardAppState) => {
      const api = apiRef.current;
      if (!api) return;

      // null вместо локальных элементов принципиален: с ними restoreElements
      // поднимает версию пришедшего элемента выше локальной, и чужая правка
      // побеждала бы всегда, а не по общему правилу.
      const restored = restoreElements(remoteElements, null);

      const merged = reconcileElements(
        api.getSceneElementsIncludingDeleted(),
        restored as unknown as RemoteElements,
        api.getAppState(),
      );

      const syncedVersions = syncedVersionsRef.current!;
      for (const element of restored) {
        if (element.version > (syncedVersions.get(element.id) ?? -1)) {
          syncedVersions.set(element.id, element.version);
        }
      }

      api.updateScene({
        elements: merged,
        ...(remoteAppState && {
          appState: remoteAppState as Pick<AppState, keyof BoardAppState>,
        }),
        // Чужие правки не должны попадать в мою историю undo/redo.
        captureUpdate: CaptureUpdateAction.NEVER,
      });

      if (remoteAppState) {
        lastAppStateRef.current = JSON.stringify(
          pickSharedAppState(api.getAppState()),
        );
      }
    },
    [apiRef],
  );

  useEffect(() => {
    const channel = `board:${boardId}`;

    const stale = centrifuge.getSubscription(channel);
    if (stale) centrifuge.removeSubscription(stale);

    const sub = centrifuge.newSubscription(channel, {
      getToken: () => latestRef.current.getBoardToken(),
    });

    let isResyncing = false;

    const resync = async () => {
      if (isResyncing) return;
      isResyncing = true;

      try {
        const scene = await latestRef.current.fetchScene();
        applyRemote(scene.elements, scene.appState);
        lastSeqRef.current = Math.max(lastSeqRef.current, scene.seq);
      } catch (error) {
        console.error("[board] не удалось перечитать сцену доски", error);
      } finally {
        isResyncing = false;
      }
    };

    const handlePublication = (ctx: PublicationContext) => {
      const event = ctx.data as Partial<BoardElementsUpdatedEvent> | undefined;
      if (event?.type !== "BOARD_ELEMENTS_UPDATED" || !event.payload) return;

      const { clientId, seq, elements, appState } = event.payload;

      const expectedSeq = lastSeqRef.current + 1;
      lastSeqRef.current = Math.max(lastSeqRef.current, seq);

      if (clientId !== BOARD_CLIENT_ID) {
        applyRemote(elements ?? [], appState);
      }

      // Номер перепрыгнул — какое-то событие потерялось. Дешевле перечитать
      // сцену, чем гадать: слияние идемпотентно, лишнее просто отбросится.
      if (seq > expectedSeq) void resync();
    };

    const handleSubscribed = (ctx: SubscribedContext) => {
      // Между загрузкой снимка и подпиской правки могли пройти мимо, а после
      // разрыва Centrifugo мог не восстановить историю — в обоих случаях
      // recovered = false, и сцену надо догнать.
      if (!ctx.recovered) void resync();
    };

    sub.on("publication", handlePublication);
    sub.on("subscribed", handleSubscribed);

    sub.subscribe();

    return () => {
      sub.removeAllListeners();
      centrifuge.removeSubscription(sub);
    };
  }, [centrifuge, boardId, applyRemote]);

  useEffect(() => {
    disposedRef.current = false;

    // На Android beforeunload не приходит, когда приложение сворачивают или
    // система его убивает, — там надёжно срабатывают только visibilitychange
    // и pagehide.
    const flushIfHidden = () => {
      if (document.visibilityState === "hidden") flush();
    };

    window.addEventListener("beforeunload", flush);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", flushIfHidden);

    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", flushIfHidden);

      disposedRef.current = true;
      flush();
    };
  }, [flush]);

  return { handleChange };
};
