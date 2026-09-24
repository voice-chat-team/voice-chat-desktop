import { useState } from "react";
import { Lock, Plus, Volume2 } from "lucide-react";

import {
  CreateChannelModal,
  ServerAsideList,
  ServerAsideListItem,
  ServerAsideListItemHeader,
  ServerAsideListItemUser,
  ServerAsideListTitle,
  ServerAsideUnorderList,
  useVoiceConnection,
} from "@/features";
import { useVoiceStore } from "@/entities/voice";
import { useServerStore } from "@/entities/server";
import {
  Button,
  CHANNEL_TYPE,
  cn,
  type ChannelDto,
  type GuildMemberDto,
  type VoiceParticipantDto,
} from "@/shared";
import {
  DEFAILT_ICONS_TITLE_SIZE,
  DEFAILT_ICONS_TOP_TITLE_SIZE,
} from "../../models";

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
  const activeVoiceChannelId = useVoiceStore((store) => store.state.channelId);
  const speakingUserIds = useVoiceStore((store) => store.state.speakingUserIds);

  const { join } = useVoiceConnection();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Имя участника берём из уже закэшированного списка участников сервера,
  // поэтому сервису голоса не нужно ходить в user-service за профилями.
  const memberByUserId = new Map(members.map((member) => [member.userId, member]));

  return (
    <>
      <ServerAsideList
        renderTitle={() => (
          <ServerAsideListTitle className="uppercase">
            <Volume2 size={DEFAILT_ICONS_TOP_TITLE_SIZE} />
            Голосовые каналы
          </ServerAsideListTitle>
        )}
        renderTitleButton={() => (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setIsCreateModalOpen(!isCreateModalOpen)}
            className="cursor-pointer h-7 w-7"
          >
            <Plus size={20} absoluteStrokeWidth />
          </Button>
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
                  onClick={() =>
                    void join(channel.guildId, channel.id, channel.name)
                  }
                >
                  <ServerAsideListItemHeader>
                    <ServerAsideListTitle>
                      <Volume2
                        size={DEFAILT_ICONS_TITLE_SIZE}
                        className={cn(
                          activeVoiceChannelId === channel.id && "text-green-500",
                        )}
                      />{" "}
                      {channel.name}
                    </ServerAsideListTitle>
                    {channel.isPrivate && <Lock size={DEFAILT_ICONS_TITLE_SIZE} />}
                  </ServerAsideListItemHeader>

                  {channelParticipants.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {channelParticipants.map((participant) => {
                        const member = memberByUserId.get(participant.userId);

                        if (!member) return null;

                        return (
                          <ServerAsideListItemUser
                            key={participant.userId}
                            user={member.user}
                            className={cn(
                              speakingUserIds.includes(participant.userId) &&
                                "text-green-500",
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
