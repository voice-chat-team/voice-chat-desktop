import { useEffect, useLayoutEffect, useRef } from "react";
import {
  SubscriptionState,
  type PublicationContext,
  type SubscribedContext,
} from "centrifuge";

import { useCurrentUser } from "@/shared";
import { useCentrifuge } from "@/shared/lib";

import {
  parseChatMessageEvent,
  personalMessagesChannel,
  type ChatMessageEvent,
} from "../model";

type Handlers = {
  onEvent: (event: ChatMessageEvent) => void;
  onSubscribed?: (ctx: SubscribedContext) => void;
};

// Подписка на личный канал сообщений общая для всех слушателей (кэш,
// системные уведомления): каждый снимает только свои обработчики, а саму
// подписку убирает последний.
export const useChatMessageEvents = (handlers: Handlers) => {
  const centrifuge = useCentrifuge();
  const { data: currentUser } = useCurrentUser();
  const userId = currentUser?.id;

  const handlersRef = useRef(handlers);
  useLayoutEffect(() => {
    handlersRef.current = handlers;
  });

  useEffect(() => {
    if (!centrifuge || !userId) return;

    const channel = personalMessagesChannel(userId);

    const sub =
      centrifuge.getSubscription(channel) ??
      centrifuge.newSubscription(channel);

    const handlePublication = (ctx: PublicationContext) => {
      const event = parseChatMessageEvent(ctx.data);
      if (event) handlersRef.current.onEvent(event);
    };

    const handleSubscribed = (ctx: SubscribedContext) =>
      handlersRef.current.onSubscribed?.(ctx);

    sub.on("publication", handlePublication);
    sub.on("subscribed", handleSubscribed);

    if (sub.state === SubscriptionState.Unsubscribed) sub.subscribe();

    return () => {
      sub.off("publication", handlePublication);
      sub.off("subscribed", handleSubscribed);

      if (sub.listeners("publication").length === 0) {
        sub.unsubscribe();
        centrifuge.removeSubscription(sub);
      }
    };
  }, [centrifuge, userId]);
};
