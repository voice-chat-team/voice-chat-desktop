import { useSuspenseQuery } from "@tanstack/react-query";

import { useGuildVoiceEvents } from "@/entities/voice";
import { useServerStore } from "@/entities/server";
import { CHANNEL_TYPE, guildApi, useGuildMembers, useGuildVoiceParticipants } from "@/shared";
import { ServerAsideVoiceChannels } from "./ServerAsideVoiceChannels";

export const ServerAsideVoiceChannelsContainer = () => {
  const guild = useServerStore((s) => s.state.guild);

  const { data: channels } = useSuspenseQuery({
    queryKey: ["get-guild-voice-channels", guild!.id],
    queryFn: async () => await guildApi.guildControllerGetChannels(guild!.id),
    select: (data) =>
      (data.data.channels ?? []).filter(
        (channel) => channel.type === CHANNEL_TYPE.VOICE,
      ),
  });

  const { data: members } = useGuildMembers(guild!.id);
  const { data: participants } = useGuildVoiceParticipants(guild!.id);

  useGuildVoiceEvents(guild!.id);

  return (
    <ServerAsideVoiceChannels
      channels={channels}
      participants={participants ?? []}
      members={members ?? []}
    />
  );
};
