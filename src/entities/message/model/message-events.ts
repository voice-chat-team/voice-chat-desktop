import type { MessageDto } from "@/shared";

export const personalMessagesChannel = (userId: string) =>
  `personal:#${userId}:messages`;

export type MessageCreatedEvent = {
  type: "MESSAGE_CREATED";
  payload: {
    message: MessageDto;
    guildName: string;
    channelName: string;
    senderName: string;
    senderAvatarUrl: string;
  };
};

export type MessageChangedEvent = {
  type: "MESSAGE_UPDATED" | "MESSAGE_DELETED";
  payload: { message: MessageDto };
};

export type ChatMessageEvent = MessageCreatedEvent | MessageChangedEvent;

const CHAT_MESSAGE_EVENT_TYPES = new Set<string>([
  "MESSAGE_CREATED",
  "MESSAGE_UPDATED",
  "MESSAGE_DELETED",
]);

export const parseChatMessageEvent = (
  data: unknown,
): ChatMessageEvent | null => {
  const event = data as Partial<ChatMessageEvent> | undefined;

  if (!event?.type || !CHAT_MESSAGE_EVENT_TYPES.has(event.type)) return null;
  if (!event.payload?.message?.id) return null;

  return event as ChatMessageEvent;
};
