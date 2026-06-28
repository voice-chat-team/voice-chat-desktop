import { queryClient } from "@/shared/api/query-client.api";
import { guildApi } from "@/shared/api/client";
import type { LoaderFunctionArgs } from "react-router";
import { userServersQueryKey } from "@/shared";

export async function serverLoader({ params }: LoaderFunctionArgs) {
  const { serverId } = params;
  if (!serverId) throw new Response("Not Found", { status: 404 });

  const response = await queryClient.ensureQueryData({
    queryKey: userServersQueryKey,
    queryFn: async () => await guildApi.guildControllerGetUserGuilds(),
  });

  const guilds = response.data.guilds;
  const guild = guilds.find((g) => g.id === serverId);

  if (!guild) {
    throw new Response("Сервер не найден", { status: 404 });
  }

  return guild;
}
