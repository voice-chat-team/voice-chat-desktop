import { useServerStore } from "@/entities/server";
import { Lock } from "lucide-react";

export const ServerAsideHeader = () => {
  const guild = useServerStore((s) => s.state.guild);

  if (!guild) return null;

  return (
    <div className="flex shrink-0 flex-col gap-0.5 border-b border-border-subtle p-4">
      <h1 className="flex items-center gap-2 truncate text-lg leading-6 font-bold text-text-primary">
        {!guild.isPublic && (
          <Lock size={15} className="shrink-0 text-text-faint" />
        )}
        <span className="truncate">{guild.name}</span>
      </h1>
      {guild.description && (
        <small className="truncate text-xs leading-4 font-medium text-text-muted">
          {guild.description}
        </small>
      )}
    </div>
  );
};
