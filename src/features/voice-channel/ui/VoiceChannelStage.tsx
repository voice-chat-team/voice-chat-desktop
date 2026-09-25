import { useMemo } from "react";
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

type StageParticipant = {
  userId: string;
  username: string;
};

export const VoiceChannelStage = ({ channel }: { channel: ChannelDto }) => {
  const speakingUserIds = useVoiceStore((store) => store.state.speakingUserIds);
  const mutedUserIds = useVoiceStore((store) => store.state.mutedUserIds);
  const connectedChannelId = useVoiceStore((store) => store.state.channelId);
  const status = useVoiceStore((store) => store.state.status);

  const { join } = useVoiceConnection();

  const { data: members } = useGuildMembers(channel.guildId);
  const { data: participants } = useGuildVoiceParticipants(channel.guildId);
  const { data: currentUser } = useCurrentUser();

  const isConnectedHere =
    connectedChannelId === channel.id && status !== "idle";

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

    // Своя плитка появляется сразу, не дожидаясь вебхука LiveKit и ответа
    // сервера, — иначе сцена секунду выглядит пустой после подключения.
    if (
      isConnectedHere &&
      currentUser &&
      !list.some((entry) => entry.userId === currentUser.id)
    ) {
      list.unshift({ userId: currentUser.id, username: currentUser.username });
    }

    return list;
  }, [members, participants, channel.id, isConnectedHere, currentUser]);

  return (
    <div className="flex h-full flex-col">
      <div className="px-4 py-4">
        <h2 className="flex items-center gap-2">
          <Volume2 size={16} />
          {channel.name}
          {channel.isPrivate && <Lock size={15} />}
          <span className="text-white bg-secondary/20 px-1.5 py-0.5 rounded-sm">
            {stageParticipants.length}
          </span>
        </h2>
      </div>

      {stageParticipants.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 text-secondary/70">
          <p className="text-sm">В канале пока никого нет</p>
          {!isConnectedHere && (
            <Button
              variant="default"
              type="button"
              onClick={() =>
                void join(channel.guildId, channel.id, channel.name)
              }
            >
              Подключиться
            </Button>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-auto scrollbar-none px-4 pb-4">
          <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
            {stageParticipants.map(({ userId, username }) => (
              <VoiceParticipantTile
                key={userId}
                username={username}
                isSpeaking={isConnectedHere && speakingUserIds.includes(userId)}
                isMuted={isConnectedHere && mutedUserIds.includes(userId)}
                isCurrentUser={userId === currentUser?.id}
              />
            ))}
          </div>

          {!isConnectedHere && (
            <div className="flex justify-center pt-6">
              <Button
                variant="default"
                type="button"
                onClick={() =>
                  void join(channel.guildId, channel.id, channel.name)
                }
              >
                Подключиться
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
