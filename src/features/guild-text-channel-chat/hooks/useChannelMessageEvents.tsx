import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  channelMessagesQueryKey,
  removeCachedMessage,
  replaceCachedMessage,
  upsertCreatedMessage,
  type MessageDto,
} from "@/shared";
import { useCentrifuge } from "@/shared/lib";

type ChannelMessageEvent = {
  type?: "MESSAGE_CREATED" | "MESSAGE_UPDATED" | "MESSAGE_DELETED";
  payload?: MessageDto;
};

export const useChannelMessageEvents = (channelId: string) => {
  const queryClient = useQueryClient();
  const centrifuge = useCentrifuge();

  useEffect(() => {
    if (!centrifuge) return;

    const channel = `guild-channel:${channelId}`;

    const sub =
      centrifuge.getSubscription(channel) ??
      centrifuge.newSubscription(channel);

    let isFirstSubscribe = true;

    sub.on("publication", (ctx) => {
      const { type, payload } = (ctx.data ?? {}) as ChannelMessageEvent;
      if (!payload?.id || payload.channelId !== channelId) return;

      const queryKey = channelMessagesQueryKey(channelId);

      if (queryClient.getQueryData(queryKey) === undefined) {
        void queryClient.invalidateQueries({ queryKey });
        return;
      }

      if (type === "MESSAGE_CREATED") {
        upsertCreatedMessage(queryClient, payload);
      } else if (type === "MESSAGE_UPDATED") {
        replaceCachedMessage(queryClient, payload);
      } else if (type === "MESSAGE_DELETED") {
        removeCachedMessage(queryClient, payload);
      }
    });

    // Канал не recoverable, поэтому публикации в момент обрыва теряются. Догружаем
    // историю при любой переподписке, а при первой — только если история успела
    // прийти раньше, чем завершилась подписка.
    sub.on("subscribed", () => {
      const queryKey = channelMessagesQueryKey(channelId);
      const hadData = queryClient.getQueryData(queryKey) !== undefined;

      if (!isFirstSubscribe || hadData) {
        void queryClient.invalidateQueries({ queryKey });
      }

      isFirstSubscribe = false;
    });

    sub.subscribe();

    return () => {
      sub.unsubscribe();
      sub.removeAllListeners();
      centrifuge.removeSubscription(sub);
    };
  }, [centrifuge, channelId, queryClient]);
};
