import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";

import { messageApi } from "@/shared/api/client";
import type { MessageDto } from "@/shared/api/generated/models/message-dto";

export const MESSAGES_PAGE_SIZE = 50;

export const channelMessagesQueryKey = (channelId: string) => [
  "channel-messages",
  channelId,
];

export type ChannelMessagesPage = {
  messages: MessageDto[];
  hasMore: boolean;
};

export type ChannelMessagesCache = InfiniteData<
  ChannelMessagesPage,
  string | undefined
>;

// Страницы приходят от новых к старым, и каждая следующая целиком старее
// предыдущей, поэтому плоский список уже отсортирован по убыванию.
const selectMessages = (data: ChannelMessagesCache) =>
  data.pages.flatMap((page) => page.messages).reverse();

export const useChannelMessages = (channelId: string, guildId: string) =>
  useInfiniteQuery({
    queryKey: channelMessagesQueryKey(channelId),
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await messageApi.messageControllerGetChannelMessages(
        channelId,
        guildId,
        pageParam,
        MESSAGES_PAGE_SIZE,
        { signal },
      );

      // gRPC-клиент на гейтвее декодирует пустой repeated-филд как undefined
      // (нет loader.defaults на стороне common/grpc), поэтому у пустого канала
      // data.messages может отсутствовать вместо [].
      const messages = data.messages ?? [];

      return {
        messages,
        hasMore: messages.length === MESSAGES_PAGE_SIZE,
      };
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;

      for (let i = allPages.length - 1; i >= 0; i--) {
        const { messages } = allPages[i];
        if (messages.length > 0) return messages[messages.length - 1].id;
      }

      return undefined;
    },
    select: selectMessages,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

const replaceInCache = (
  cache: ChannelMessagesCache,
  message: MessageDto,
): ChannelMessagesCache => {
  let changed = false;

  const pages = cache.pages.map((page) => {
    const index = page.messages.findIndex((m) => m.id === message.id);
    if (index === -1) return page;

    changed = true;
    const messages = page.messages.slice();
    messages[index] = message;

    return { ...page, messages };
  });

  return changed ? { ...cache, pages } : cache;
};

export const upsertCreatedMessage = (
  queryClient: QueryClient,
  message: MessageDto,
) =>
  queryClient.setQueryData<ChannelMessagesCache>(
    channelMessagesQueryKey(message.channelId),
    (old) => {
      if (!old || old.pages.length === 0) return old;

      const exists = old.pages.some((page) =>
        page.messages.some((m) => m.id === message.id),
      );

      if (exists) return old;

      const [newest, ...older] = old.pages;

      return {
        ...old,
        pages: [
          { ...newest, messages: [message, ...newest.messages] },
          ...older,
        ],
      };
    },
  );

export const replaceCachedMessage = (
  queryClient: QueryClient,
  message: MessageDto,
) =>
  queryClient.setQueryData<ChannelMessagesCache>(
    channelMessagesQueryKey(message.channelId),
    (old) => (old ? replaceInCache(old, message) : old),
  );

export const removeCachedMessage = (
  queryClient: QueryClient,
  message: MessageDto,
) =>
  queryClient.setQueryData<ChannelMessagesCache>(
    channelMessagesQueryKey(message.channelId),
    (old) => {
      if (!old) return old;

      let changed = false;

      const pages = old.pages.map((page) => {
        if (!page.messages.some((m) => m.id === message.id)) return page;

        changed = true;
        return {
          ...page,
          messages: page.messages.filter((m) => m.id !== message.id),
        };
      });

      return changed ? { ...old, pages } : old;
    },
  );
