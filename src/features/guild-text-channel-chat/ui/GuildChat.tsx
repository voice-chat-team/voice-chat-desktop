import { Fragment, useLayoutEffect, useMemo, useRef } from "react";

import {
  useChannelMessages,
  useCurrentUser,
  useGuildMembers,
  type ChannelDto,
} from "@/shared";

import { useChannelMessageEvents, useSendMessage } from "../hooks";
import { formatDayLabel, isGroupStart, isNewDay } from "../lib";
import { GuildChatHeader } from "./GuildChatHeader";
import { GuildChatFooter } from "./GuildChatFooter";
import { GuildChatWrapper } from "./GuildChatWrapper";
import { GuildChatDayDivider, GuildChatMessage } from "./GuildChatMessage";

const NEAR_BOTTOM_PX = 120;
const TOP_TRIGGER_PX = 80;

export const GuildChat = ({ channel }: { channel: ChannelDto }) => {
  const {
    data: messages,
    isPending,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useChannelMessages(channel.id, channel.guildId);

  const { data: members } = useGuildMembers(channel.guildId);
  const { data: currentUser } = useCurrentUser();
  const { sendMessage, isSending } = useSendMessage(
    channel.id,
    channel.guildId,
  );

  useChannelMessageEvents(channel.id);

  const authors = useMemo(
    () => new Map(members.map((member) => [member.userId, member.user])),
    [members],
  );

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isNearBottomRef = useRef(true);
  const distanceFromBottomRef = useRef<number | null>(null);
  const didInitialScrollRef = useRef(false);
  const newestIdRef = useRef<string | null>(null);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    isNearBottomRef.current =
      el.scrollHeight - el.scrollTop - el.clientHeight <= NEAR_BOTTOM_PX;

    if (el.scrollTop <= TOP_TRIGGER_PX && hasNextPage && !isFetchingNextPage) {
      distanceFromBottomRef.current = el.scrollHeight - el.scrollTop;
      void fetchNextPage();
    }
  };

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !messages) return;

    const newest =
      messages.length > 0 ? messages[messages.length - 1] : undefined;
    const newestId = newest?.id ?? null;

    if (distanceFromBottomRef.current !== null) {
      el.scrollTop = el.scrollHeight - distanceFromBottomRef.current;
      distanceFromBottomRef.current = null;
      newestIdRef.current = newestId;
      return;
    }

    if (!didInitialScrollRef.current && messages.length > 0) {
      didInitialScrollRef.current = true;
      newestIdRef.current = newestId;
      el.scrollTop = el.scrollHeight;
      return;
    }

    if (newestId !== newestIdRef.current) {
      newestIdRef.current = newestId;

      if (isNearBottomRef.current || newest?.senderId === currentUser?.id) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [messages, currentUser?.id]);

  return (
    <div className="flex flex-col h-full">
      <GuildChatHeader />

      <GuildChatWrapper ref={scrollRef} onScroll={handleScroll}>
        {isPending && (
          <p className="m-auto text-sm text-text-faint">Загрузка сообщений...</p>
        )}

        {!isPending && messages?.length === 0 && (
          <p className="m-auto text-sm text-text-faint">
            Здесь пока нет сообщений. Напишите первое!
          </p>
        )}

        {isFetchingNextPage && (
          <p className="text-center text-xs text-text-muted">
            Загрузка истории...
          </p>
        )}

        {messages?.map((message, index) => {
          const author = authors.get(message.senderId);
          const previous = index > 0 ? messages[index - 1] : undefined;

          return (
            <Fragment key={message.id}>
              {isNewDay(previous, message) && (
                <GuildChatDayDivider label={formatDayLabel(message.createdAt)} />
              )}
              <GuildChatMessage
                authorId={message.senderId}
                username={author?.username ?? "Неизвестный пользователь"}
                avatarUrl={author?.avatarUrl}
                content={message.content}
                createdAt={message.createdAt}
                isEdited={message.isEdited}
                isGroupStart={isGroupStart(previous, message)}
              />
            </Fragment>
          );
        })}
      </GuildChatWrapper>

      <GuildChatFooter onSend={sendMessage} isSending={isSending} />
    </div>
  );
};
