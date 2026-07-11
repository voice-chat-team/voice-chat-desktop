import { useServerStore } from "@/entities/server";
import { Lock } from "lucide-react";

export const GuildChatHeader = () => {
  const activeTextChannel = useServerStore((store) => store.state.activeTextChannel);

  return (
    <div className="px-4 py-4">
      <h2 className="flex items-center gap-2">{activeTextChannel?.name }  {activeTextChannel?.isPrivate && <Lock size={15} />}</h2>
      {/*<small className="text-accent">Чат для информаирования</small>*/}
    </div>
  );
};
