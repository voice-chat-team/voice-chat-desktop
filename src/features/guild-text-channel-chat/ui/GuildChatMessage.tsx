import { Avatar, AvatarFallback, AvatarImage } from "@/shared";

interface GuildChatMessageProps {
  username: string;
  content: string;
  createdAt: string;
  avatarUrl?: string;
  isEdited?: boolean;
}

export const GuildChatMessage = ({
  username,
  content,
  createdAt,
  avatarUrl,
  isEdited,
}: GuildChatMessageProps) => {
  const time = new Date(createdAt).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex gap-2 items-start">
      <Avatar size="lg">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
        <AvatarFallback className="text-base">
          {username.slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-0.5">
        <p className="text-sm text-white/80 font-medium flex gap-2 items-center">
          {username}
          <span className="text-accent text-xs"> {time}</span>
          {isEdited && <span className="text-accent text-xs">(изменено)</span>}
        </p>

        <p className="text-sm text-secondary font-light max-w-3xl leading-6 whitespace-pre-wrap wrap-break-word">
          {content}
        </p>
      </div>
    </div>
  );
};
