import { useQueryClient } from "@tanstack/react-query";

import {
  channelMessagesRootQueryKey,
  removeCachedMessage,
  replaceCachedMessage,
  upsertCreatedMessage,
} from "@/shared";

import { useChatMessageEvents } from "./useChatMessageEvents";

// Держит кэш всех загруженных чатов в актуальном состоянии, открыт чат или
// нет.
export const useMessageCacheSync = () => {
  const queryClient = useQueryClient();

  useChatMessageEvents({
    onEvent: ({ type, payload: { message } }) => {
      if (type === "MESSAGE_DELETED" || message.isDeleted) {
        removeCachedMessage(queryClient, message);
      } else if (type === "MESSAGE_CREATED") {
        upsertCreatedMessage(queryClient, message);
      } else {
        replaceCachedMessage(queryClient, message);
      }
    },
    // recovered = false — Centrifugo не смог дослать пропущенное после
    // разрыва (или recovery не включён), значит, кэши могли отстать.
    // Открытый чат перезапросится сразу, остальные — при открытии.
    onSubscribed: (ctx) => {
      if (!ctx.recovered) {
        void queryClient.invalidateQueries({
          queryKey: channelMessagesRootQueryKey,
        });
      }
    },
  });
};
