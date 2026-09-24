import { useSuspenseQuery } from "@tanstack/react-query";
import { ServerAsideTextChannels } from "./ServerAsideTextChannels";
import { useServerStore } from "@/entities/server";
import { CHANNEL_TYPE, guildApi } from "@/shared";

export const ServerAsideTextChannelsContainer = () => {
  const guild = useServerStore((s) => s.state.guild);

  const { data: channels } = useSuspenseQuery({
    queryKey: ["get-guild-text-channels", guild!.id],
    queryFn: async () => await guildApi.guildControllerGetChannels(guild!.id),
    // Эндпоинт отдаёт каналы всех типов, а список рисует их с иконкой #,
    // поэтому голосовые отсекаем здесь.
    select: (data) =>
      (data.data.channels ?? []).filter(
        (channel) => channel.type === CHANNEL_TYPE.TEXT,
      ),
  });

  return <ServerAsideTextChannels channels={channels} />;
};
