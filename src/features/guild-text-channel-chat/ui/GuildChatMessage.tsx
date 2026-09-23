import { Avatar, AvatarFallback, AvatarImage } from "@/shared";
import { Bubble, BubbleContent } from "@/shared/ui/bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/shared/ui/message";

interface GuildChatMessageProps {
  username: string;
  content: string;
  createdAt: string;
  avatarUrl?: string;
  isEdited?: boolean;
  isMyMessage?: boolean;
}

export const GuildChatMessage = ({
  username,
  content,
  createdAt,
  avatarUrl,
  isEdited,
  isMyMessage,
}: GuildChatMessageProps) => {
  const time = new Date(createdAt).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Message align={isMyMessage ? "end" : "start"}>
      <MessageAvatar>
        <Avatar size="lg">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
          <AvatarFallback className="text-base">
            {username.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </MessageAvatar>
      <MessageContent>
        <MessageHeader> {username}</MessageHeader>
        <Bubble variant={isMyMessage ? "default" : "muted"}>
          <BubbleContent className="whitespace-pre-wrap wrap-break-word">
            {content}
          </BubbleContent>
        </Bubble>
        <MessageFooter className="flex gap-1">
          <span className="text-accent text-xs"> {time}</span>
          {isEdited && <span className="text-accent text-xs">(изменено)</span>}
        </MessageFooter>
      </MessageContent>
    </Message>
  );
};
