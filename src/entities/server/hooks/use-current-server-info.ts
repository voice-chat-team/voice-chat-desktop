import { useEffect } from "react";
import { useUserServers } from "../../../shared/api/queries/use-user-servers";
import { useServerStore } from "@/entities/server/store";

export function useCurrentServerInfo(guildId: string) {
  const { data: guilds, isLoading } = useUserServers();
  const setGuild = useServerStore((s) => s.setGuild);

  const guild = guilds?.find((g) => g.id === guildId) ?? null;

  useEffect(() => {
    setGuild(guild);
  }, [guild, setGuild]);

  return { guild, isLoading };
}
