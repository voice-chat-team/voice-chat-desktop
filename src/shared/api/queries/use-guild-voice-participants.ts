import { useQuery, type QueryClient } from "@tanstack/react-query";

import { voiceApi } from "@/shared/api/client";
import type { VoiceParticipantDto } from "@/shared/api/generated/models/voice-participant-dto";

export const guildVoiceParticipantsQueryKey = (guildId: string) => [
  "guild-voice-participants",
  guildId,
];

/**
 * Состав всех голосовых каналов сервера одним списком. Источник истины —
 * LiveKit, поэтому после переподключения данные всегда актуальны.
 * Дальнейшие изменения приезжают по Centrifugo и пишутся прямо в кэш.
 */
export const useGuildVoiceParticipants = (guildId: string) =>
  useQuery({
    queryKey: guildVoiceParticipantsQueryKey(guildId),
    queryFn: async ({ signal }) => {
      const { data } = await voiceApi.voiceControllerGetGuildVoiceParticipants(
        guildId,
        { signal },
      );

      // gRPC-клиент на гейтвее может отдать undefined вместо пустого массива,
      // если в голосовых каналах сервера сейчас никого нет.
      return data.participants ?? [];
    },
    staleTime: 30_000,
  });

export const upsertVoiceParticipant = (
  queryClient: QueryClient,
  participant: VoiceParticipantDto,
) => {
  queryClient.setQueryData(
    guildVoiceParticipantsQueryKey(participant.guildId),
    (old: VoiceParticipantDto[] | undefined) => {
      if (!old) return old;

      // Пользователь может быть только в одном голосовом канале сервера:
      // переход между каналами приходит как отдельные LEFT и JOINED, но
      // порядок доставки не гарантирован, поэтому старую запись убираем всегда.
      const rest = old.filter((p) => p.userId !== participant.userId);

      return [...rest, participant];
    },
  );
};

export const removeVoiceParticipant = (
  queryClient: QueryClient,
  participant: VoiceParticipantDto,
) => {
  queryClient.setQueryData(
    guildVoiceParticipantsQueryKey(participant.guildId),
    (old: VoiceParticipantDto[] | undefined) => {
      if (!old) return old;

      return old.filter(
        (p) =>
          !(
            p.userId === participant.userId &&
            p.channelId === participant.channelId
          ),
      );
    },
  );
};
