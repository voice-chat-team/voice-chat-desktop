import { useMemo, type CSSProperties } from "react";
import { Lock, Volume2 } from "lucide-react";

import { useVoiceStore } from "@/entities/voice";
import {
  Button,
  useCurrentUser,
  useGuildMembers,
  useGuildVoiceParticipants,
  type ChannelDto,
} from "@/shared";

import { useVoiceConnection } from "../hooks/useVoiceConnection";
import { VoiceParticipantTile } from "./VoiceParticipantTile";
import { Skeleton } from "@/shared/ui/skeleton";

type StageParticipant = {
  userId: string;
  username: string;
};

export const VoiceChannelStage = ({ channel }: { channel: ChannelDto }) => {
  const speakingUserIds = useVoiceStore((store) => store.state.speakingUserIds);
  const mutedUserIds = useVoiceStore((store) => store.state.mutedUserIds);
  const connectedChannelId = useVoiceStore((store) => store.state.channelId);
  const status = useVoiceStore((store) => store.state.status);

  const { data: members } = useGuildMembers(channel.guildId);
  const { data: participants } = useGuildVoiceParticipants(channel.guildId);
  const { data: currentUser } = useCurrentUser();

  const isConnectedHere =
    connectedChannelId === channel.id && status !== "idle";

  const isConnecting =
    connectedChannelId === channel.id &&
    (status === "connecting" || status === "reconnecting");

  const stageParticipants = useMemo<StageParticipant[]>(() => {
    const usernameById = new Map(
      members.map((member) => [member.userId, member.user.username]),
    );

    const list = (participants ?? [])
      .filter((participant) => participant.channelId === channel.id)
      .map((participant) => ({
        userId: participant.userId,
        username: usernameById.get(participant.userId),
      }))
      .filter((entry): entry is StageParticipant => Boolean(entry.username));

    if (
      isConnectedHere &&
      currentUser &&
      !list.some((entry) => entry.userId === currentUser.id)
    ) {
      list.unshift({ userId: currentUser.id, username: currentUser.username });
    }

    return list;
  }, [members, participants, channel.id, isConnectedHere, currentUser]);

  const gridSize = useMemo(() => {
    const count = Math.max(stageParticipants.length, 1);
    const cols = Math.ceil(Math.sqrt(count));
    return { cols, rows: Math.ceil(count / cols) };
  }, [stageParticipants.length]);

  return (
    <div className="flex h-full flex-col px-4 py-4 gap-3">
      <div>
        <h2 className="flex items-center gap-2">
          <Volume2 size={16} />
          {channel.name}
          {channel.isPrivate && <Lock size={15} />}
          <span className="text-white bg-secondary/20 px-1.5 py-0.5 rounded-sm">
            {stageParticipants.length}
          </span>
        </h2>
      </div>

      {isConnecting ? (
        <Skeleton className="flex flex-1 flex-col items-center justify-center gap-4 bg-gray-400/10">
          Подключение к комнате...
        </Skeleton>
      ) : (
        <div className="flex-1 min-h-0 overflow-auto scrollbar-none">
          <div
            className="flex h-full flex-wrap content-stretch justify-center gap-3"
            style={
              {
                "--cols": gridSize.cols,
                "--rows": gridSize.rows,
              } as CSSProperties
            }
          >
            {stageParticipants.map(({ userId, username }) => (
              <div
                key={userId}
                className="w-[calc((100%-(var(--cols)-1)*0.75rem)/var(--cols))] h-[calc((100%-(var(--rows)-1)*0.75rem)/var(--rows))] min-h-35"
              >
                <VoiceParticipantTile
                  username={username}
                  isSpeaking={
                    isConnectedHere && speakingUserIds.includes(userId)
                  }
                  isMuted={isConnectedHere && mutedUserIds.includes(userId)}
                  isCurrentUser={userId === currentUser?.id}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
