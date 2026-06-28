import { useServerStore } from "@/entities/server";
import { Lock } from "lucide-react";

export const ServerAsideHeader = () => {
  const guild = useServerStore((s) => s.state.guild);

  if (!guild) return null;

  return (
    <div className="leading-2.5 flex gap-1 flex-col">
      <h1 className="text-white text-xl font-medium truncate flex gap-2 items-center">
        {!guild.isPublic && <Lock size={15} />} {guild.name}
      </h1>
      {guild.description && (
        <small className="text-secondary/65 text-xs">{guild.description}</small>
      )}
    </div>
  );
};
