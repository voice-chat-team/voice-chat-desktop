import { useQuery } from "@tanstack/react-query";
import { guildApi } from "@/shared/api/client";

export const userServersQueryKey = ["user-servers"];

export function useUserServers() {
  return useQuery({
    queryKey: userServersQueryKey,
    queryFn: async () => await guildApi.guildControllerGetUserGuilds(),
    select: (response) => response.data.guilds,
    staleTime: 2 * 60 * 1000,
  });
}
