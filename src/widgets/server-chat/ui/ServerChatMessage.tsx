import { Avatar, AvatarFallback } from "@/shared";

interface ServerChatMessageProps {
  usename: string;
  message: string;
}

export const ServerChatMessage = ({
  usename,
  message,
}: ServerChatMessageProps) => {
  return (
    <div className="flex gap-2 items-start">
      <Avatar size="lg">
        <AvatarFallback className="text-base">
          {usename.slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col gap-0.5">
        <p className="text-sm text-white/80 font-medium flex gap-2 items-center">
          {usename}
          <span className="text-accent text-xs"> 21:20</span>
        </p>

        <p className="text-sm text-secondary font-light max-w-3xl leading-6">
          {message}
        </p>
      </div>
    </div>
  );
};
