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
      className="flex flex-col flex-1 min-h-0 px-4 pt-8 pb-4 overflow-x-hidden overflow-y-auto scrollbar-thin scrollbar-thumb-surface-raised scrollbar-track-transparent"
    >
      {children}
    </div>
  );
};
