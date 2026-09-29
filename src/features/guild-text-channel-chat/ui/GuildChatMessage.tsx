import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  cn,
  getAvatarColorClass,
} from "@/shared";

interface GuildChatMessageProps {
  authorId: string;
  username: string;
  content: string;
  createdAt: string;
  avatarUrl?: string;
  isEdited?: boolean;
  isGroupStart?: boolean;
}

export const GuildChatMessage = ({
  authorId,
  username,
  content,
  createdAt,
  avatarUrl,
  isEdited,
  isGroupStart = true,
}: GuildChatMessageProps) => {
  const time = new Date(createdAt).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const body = (
    <p className="text-[15px] leading-[22px] whitespace-pre-wrap wrap-break-word text-text-secondary">
      {content}
      {isEdited && (
        <span className="ml-1 text-xs text-text-muted">(изменено)</span>
      )}
    </p>
  );

  if (!isGroupStart) {
    return (
      <div className="group flex gap-2 rounded-md px-2 py-px transition-colors hover:bg-surface-raised/20">
        <div className="flex w-9 shrink-0 items-center justify-center">
          <time
            dateTime={createdAt}
            className="hidden text-[10px] leading-4 font-medium text-text-muted group-hover:block"
          >
            {time}
          </time>
        </div>
        <div className="min-w-0 flex-1">{body}</div>
      </div>
    );
  }

  return (
    <div className="group mt-4 flex gap-2 rounded-md px-2 py-0.5 transition-colors first:mt-0 hover:bg-surface-raised/20">
      <Avatar className="mt-0.5 size-9">
        {avatarUrl && <AvatarImage src={avatarUrl} alt={username} />}
        <AvatarFallback
          className={cn(
            "text-sm font-semibold text-text-on-brand",
            getAvatarColorClass(authorId),
          )}
        >
          {username.slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-[15px] leading-5 font-semibold text-text-primary">
            {username}
          </span>
          <time
            dateTime={createdAt}
            className="shrink-0 text-xs leading-4 font-medium text-text-muted"
          >
            {time}
          </time>
        </div>
        {body}
      </div>
    </div>
  );
};

export const GuildChatDayDivider = ({ label }: { label: string }) => {
  return (
    <div
      role="separator"
      className="mt-4 flex items-center gap-2 text-xs leading-4 font-medium text-text-muted before:h-px before:flex-1 before:bg-border-subtle after:h-px after:flex-1 after:bg-border-subtle first:mt-0"
    >
      {label}
    </div>
  );
};
