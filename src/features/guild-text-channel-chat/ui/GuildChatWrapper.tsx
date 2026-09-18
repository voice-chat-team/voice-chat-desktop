import type { PropsWithChildren, Ref, UIEventHandler } from "react";

type GuildChatWrapperProps = PropsWithChildren<{
  ref?: Ref<HTMLDivElement>;
  onScroll?: UIEventHandler<HTMLDivElement>;
}>;

export const GuildChatWrapper = ({
  children,
  ref,
  onScroll,
}: GuildChatWrapperProps) => {
  return (
    <div
      ref={ref}
      onScroll={onScroll}
      className="flex flex-col gap-8 flex-1 min-h-0 px-4 py-4 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent"
    >
      {children}
    </div>
  );
};
