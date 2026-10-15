import { useEffect, useRef } from "react";

import { useChatMessageEvents } from "@/entities/message";
import { useServerStore } from "@/entities/server";
import { useCurrentUser } from "@/shared";

import {
  ensureNotificationPermission,
  showSystemNotification,
  trackWindowFocus,
} from "../lib";

// Быстрая переписка в одном канале не должна засыпать уведомлениями:
// не чаще одного на канал за этот интервал.
const CHANNEL_THROTTLE_MS = 3_000;
const PREVIEW_LENGTH = 200;
const SEEN_IDS_LIMIT = 200;

export const useMessageNotifications = () => {
  const { data: currentUser } = useCurrentUser();
  const currentUserId = currentUser?.id;

  const isFocusedRef = useRef(true);
  const lastShownAtRef = useRef(new Map<string, number>());
  const seenIdsRef = useRef(new Set<string>());

  useEffect(() => {
    void ensureNotificationPermission();

    return trackWindowFocus((focused) => {
      isFocusedRef.current = focused;
    });
  }, []);

  useChatMessageEvents({
    onEvent: (event) => {
      if (event.type !== "MESSAGE_CREATED") return;

      const { message, guildName, channelName, senderName } = event.payload;

      // Своё сообщение приходит только для синхронизации других устройств.
      if (message.senderId === currentUserId) return;

      // Доставка «хотя бы один раз»: повтор рассылки не должен дать второе
      // уведомление о том же сообщении.
      const seenIds = seenIdsRef.current;
      if (seenIds.has(message.id)) return;
      seenIds.add(message.id);
      if (seenIds.size > SEEN_IDS_LIMIT) {
        seenIds.delete(seenIds.values().next().value!);
      }

      const { activeTextChannel } = useServerStore.getState().state;
      if (isFocusedRef.current && activeTextChannel?.id === message.channelId) {
        return;
      }

      const now = Date.now();
      const lastShownAt = lastShownAtRef.current;
      const last = lastShownAt.get(message.channelId) ?? 0;
      if (now - last < CHANNEL_THROTTLE_MS) return;
      lastShownAt.set(message.channelId, now);

      const preview = message.content.slice(0, PREVIEW_LENGTH);

      void showSystemNotification({
        title: `${senderName} • #${channelName}`,
        body: guildName ? `${guildName}: ${preview}` : preview,
      });
    },
  });
};
