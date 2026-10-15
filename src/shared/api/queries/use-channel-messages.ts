import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";

import { messageApi } from "@/shared/api/client";
import type { MessageDto } from "@/shared/api/generated/models/message-dto";

export const MESSAGES_PAGE_SIZE = 50;

export const channelMessagesRootQueryKey = ["channel-messages"];

export const channelMessagesQueryKey = (channelId: string) => [
  ...channelMessagesRootQueryKey,
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

// События приходят «хотя бы один раз» и не обязательно по порядку, поэтому
// всё применяется идемпотентно: старая версия сообщения не затирает новую.
const isNewer = (incoming: MessageDto, cached: MessageDto) =>
  Date.parse(incoming.updatedAt) > Date.parse(cached.updatedAt);

const hasMessage = (cache: ChannelMessagesCache, messageId: string) =>
  cache.pages.some((page) => page.messages.some((m) => m.id === messageId));

const replaceInCache = (
  cache: ChannelMessagesCache,
  message: MessageDto,
): ChannelMessagesCache => {
  let changed = false;

  const pages = cache.pages.map((page) => {
    const index = page.messages.findIndex((m) => m.id === message.id);
    if (index === -1 || !isNewer(message, page.messages[index])) return page;

    changed = true;
    const messages = page.messages.slice();
    messages[index] = message;

    return { ...page, messages };
  });

  return changed ? { ...cache, pages } : cache;
};

// Если кэша канала нет, ничего не делаем: при открытии канала история
// загрузится целиком, вместе с этим сообщением.
export const upsertCreatedMessage = (
  queryClient: QueryClient,
  message: MessageDto,
) =>
  queryClient.setQueryData<ChannelMessagesCache>(
    channelMessagesQueryKey(message.channelId),
    (old) => {
      if (!old || old.pages.length === 0) return old;

      if (hasMessage(old, message.id)) return replaceInCache(old, message);

      const [newest, ...older] = old.pages;

      // Страница отсортирована от новых к старым; обычно сообщение встаёт
      // в начало, но событие от другого инстанса может прийти с опозданием.
      const createdAt = Date.parse(message.createdAt);
      const index = newest.messages.findIndex(
        (m) => Date.parse(m.createdAt) < createdAt,
      );
      const messages = newest.messages.slice();
      messages.splice(index === -1 ? messages.length : index, 0, message);

      return { ...old, pages: [{ ...newest, messages }, ...older] };
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
