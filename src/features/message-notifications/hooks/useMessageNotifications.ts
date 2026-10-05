import { useEffect } from "react";

import { useServerStore } from "@/entities/server";
import { NotificationType, useCurrentUser } from "@/shared";
import { useCentrifuge } from "@/shared/lib";

import {
  ensureNotificationPermission,
  showSystemNotification,
  trackWindowFocus,
} from "../lib";

type NewGuildMessageEvent = {
  type?: string;
  payload?: {
    messageId: string;
    guildId: string;
    guildName: string;
    channelId: string;
    channelName: string;
    senderId: string;
    senderName: string;
    senderAvatarUrl: string;
    preview: string;
    createdAt: string;
  };
};

// Быстрая переписка в одном канале не должна засыпать уведомлениями:
// не чаще одного на канал за этот интервал.
const CHANNEL_THROTTLE_MS = 3_000;

export const useMessageNotifications = () => {
  const centrifuge = useCentrifuge();
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;

  useEffect(() => {
    void ensureNotificationPermission();
  }, []);

  useEffect(() => {
    if (!centrifuge || !currentUserId) return;

    let isFocused = true;
    const stopTrackingFocus = trackWindowFocus((focused) => {
      isFocused = focused;
    });

    const lastShownAt = new Map<string, number>();

    const channel = `personal:#${currentUserId}:messages`;

    const sub =
      centrifuge.getSubscription(channel) ??
      centrifuge.newSubscription(channel);

    sub.on("publication", (ctx) => {
      const { type, payload } = (ctx.data ?? {}) as NewGuildMessageEvent;

      if (type !== NotificationType.NewGuildMessage || !payload) return;
      // Сервер автору и так не шлёт, это страховка.
      if (payload.senderId === currentUserId) return;

      const { activeTextChannel } = useServerStore.getState().state;
      if (isFocused && activeTextChannel?.id === payload.channelId) return;

      const now = Date.now();
      const last = lastShownAt.get(payload.channelId) ?? 0;
      if (now - last < CHANNEL_THROTTLE_MS) return;
      lastShownAt.set(payload.channelId, now);

      void showSystemNotification({
        title: `${payload.senderName} • #${payload.channelName}`,
        body: payload.guildName
          ? `${payload.guildName}: ${payload.preview}`
          : payload.preview,
      });
    });

    sub.subscribe();

    return () => {
      stopTrackingFocus();
      sub.unsubscribe();
      sub.removeAllListeners();
      centrifuge.removeSubscription(sub);
    };
  }, [centrifuge, currentUserId]);
};
