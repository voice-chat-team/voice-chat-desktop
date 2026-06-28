import { useSuspenseQuery } from "@tanstack/react-query";
import { ServerAsideTextChannels } from "./ServerAsideTextChannels";
import { useServerStore } from "@/entities/server";
import { guildApi } from "@/shared";

export const ServerAsideTextChannelsContainer = () => {
  const guild = useServerStore((s) => s.state.guild);

  const { data: channels } = useSuspenseQuery({
    queryKey: ["get-guild-text-channels", guild!.id],
    queryFn: async () => await guildApi.guildControllerGetChannels(guild!.id),
    select: (data) => data.data.channels,
  });

  return <ServerAsideTextChannels channels={channels ?? []} />;
};
