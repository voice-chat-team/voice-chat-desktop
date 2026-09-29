import { useServerStore } from "@/entities/server";
import { Hash, Lock } from "lucide-react";

export const GuildChatHeader = () => {
  const activeTextChannel = useServerStore(
    (store) => store.state.activeTextChannel,
  );

  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-border-subtle px-4 py-3">
      <Hash size={18} className="shrink-0 text-text-faint" />
      <h2 className="truncate text-base leading-[22px] font-semibold text-text-primary">
        {activeTextChannel?.name}
      </h2>
      {activeTextChannel?.isPrivate && (
        <Lock size={14} className="shrink-0 text-text-faint" />
      )}
    </div>
  );
};
