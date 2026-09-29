import { useState } from "react";
import { Lock, Plus, Volume2 } from "lucide-react";

import {
  CreateChannelModal,
  ServerAsideList,
  ServerAsideListItem,
  ServerAsideListItemHeader,
  ServerAsideListItemUser,
  ServerAsideListTitle,
  ServerAsideListTitleButton,
  ServerAsideUnorderList,
  useVoiceConnection,
} from "@/features";
import { useVoiceStore } from "@/entities/voice";
import { useServerStore } from "@/entities/server";
import {
  CHANNEL_TYPE,
  cn,
  type ChannelDto,
  type GuildMemberDto,
  type VoiceParticipantDto,
} from "@/shared";
import { DEFAILT_ICONS_TITLE_SIZE } from "../../models";

type ServerAsideVoiceChannelsProps = {
  channels: ChannelDto[];
  participants: VoiceParticipantDto[];
  members: GuildMemberDto[];
};

export const ServerAsideVoiceChannels = ({
  channels,
  participants,
  members,
}: ServerAsideVoiceChannelsProps) => {
  const guildId = useServerStore((store) => store.state.guild?.id);
  const setActiveVoiceChannel = useServerStore(
    (store) => store.actions.setActiveVoiceChannel,
  );
  const activeVoiceChannelId = useVoiceStore((store) => store.state.channelId);
  const speakingUserIds = useVoiceStore((store) => store.state.speakingUserIds);

  const { join } = useVoiceConnection();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const memberByUserId = new Map(
    members.map((member) => [member.userId, member]),
  );

  return (
    <>
      <ServerAsideList
        renderTitle={() => (
          <ServerAsideListTitle>Голосовые каналы</ServerAsideListTitle>
        )}
        renderTitleButton={() => (
          <ServerAsideListTitleButton
            onClick={() => setIsCreateModalOpen(!isCreateModalOpen)}
            aria-label="Создать голосовой канал"
          >
            <Plus />
          </ServerAsideListTitleButton>
        )}
        renderList={() => (
          <ServerAsideUnorderList>
            {channels.map((channel) => {
              const channelParticipants = participants.filter(
                (participant) => participant.channelId === channel.id,
              );

              return (
                <ServerAsideListItem
                  key={channel.id}
                  onClick={() => {
                    join(channel.guildId, channel.id, channel.name);
                    setActiveVoiceChannel(channel);
                  }}
                >
                  <ServerAsideListItemHeader>
                    <ServerAsideListTitle>
                      <Volume2
                        size={DEFAILT_ICONS_TITLE_SIZE}
                        className={cn(
                          activeVoiceChannelId === channel.id &&
                            "text-status-online!",
                        )}
                      />
                      {channel.name}
                    </ServerAsideListTitle>
                    {channel.isPrivate && (
                      <Lock size={14} />
                    )}
                  </ServerAsideListItemHeader>

                  {channelParticipants.length > 0 && (
                    <div className="flex flex-col gap-1.5 pl-6">
                      {channelParticipants.map((participant) => {
                        const member = memberByUserId.get(participant.userId);

                        if (!member) return null;

                        return (
                          <ServerAsideListItemUser
                            key={participant.userId}
                            user={member.user}
                            size="sm"
                            className={cn(
                              speakingUserIds.includes(participant.userId) &&
                                "text-status-online",
                            )}
                          />
                        );
                      })}
                    </div>
                  )}
                </ServerAsideListItem>
              );
            })}
          </ServerAsideUnorderList>
        )}
      />

      <CreateChannelModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        guildId={guildId ?? ""}
        channelType={CHANNEL_TYPE.VOICE}
      />
    </>
  );
};
