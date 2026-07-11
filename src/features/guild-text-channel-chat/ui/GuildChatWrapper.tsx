import { PropsWithChildren } from "react";

export const GuildChatWrapper = ({ children }: PropsWithChildren) => {
  return (
    <div className="flex flex-col gap-8 h-full px-4 py-4 overflow-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent">
      {children}
    </div>
  );
};
