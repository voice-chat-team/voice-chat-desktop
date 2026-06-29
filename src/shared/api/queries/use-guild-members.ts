import { guildApi } from "@/shared";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useGuildMembers = (guildId: string) => {
  return useSuspenseQuery({
    queryKey: ["get-guild-members", guildId],
    queryFn: async () => await guildApi.guildControllerGetGuildMembers(guildId),
    select: (data) => data.data.members,
    staleTime: 60_000,
  });
};
