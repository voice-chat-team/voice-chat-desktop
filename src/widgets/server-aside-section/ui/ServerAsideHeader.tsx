import { useServerStore } from "@/entities/server";

export const ServerAsideHeader = () => {
  const guild = useServerStore((s) => s.guild);

  if (!guild) return null;

  return (
    <div className="leading-2.5 flex gap-1 flex-col">
      <h1 className="text-white text-xl font-medium truncate">{guild.name}</h1>
      {typeof guild.description === "string" && guild.description && (
        <small className="text-secondary/65 text-xs">{guild.description}</small>
      )}
    </div>
  );
};
