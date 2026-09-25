import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  guildVoiceParticipantsQueryKey,
  removeVoiceParticipant,
  upsertVoiceParticipant,
  type VoiceParticipantDto,
} from "@/shared";
import { useCentrifuge } from "@/shared/lib";

type GuildVoiceEvent = {
  type?: "VOICE_PARTICIPANT_JOINED" | "VOICE_PARTICIPANT_LEFT";
  payload?: VoiceParticipantDto;
};

/**
 * Канал guild:{guildId} общий: кроме голосовых событий в нём ходят события
 * состава участников сервера с совсем другой формой payload, поэтому обработчик
 * обязан сначала смотреть на type и молча пропускать чужое.
 */
export const useGuildVoiceEvents = (guildId: string) => {
  const queryClient = useQueryClient();
  const centrifuge = useCentrifuge();

  useEffect(() => {
    if (!centrifuge) return;

    const channel = `guild:${guildId}`;

    const sub =
      centrifuge.getSubscription(channel) ??
      centrifuge.newSubscription(channel);

    let isFirstSubscribe = true;

    const handlePublication = (ctx: { data?: unknown }) => {
      const { type, payload } = (ctx.data ?? {}) as GuildVoiceEvent;

      if (type !== "VOICE_PARTICIPANT_JOINED" && type !== "VOICE_PARTICIPANT_LEFT") {
        return;
      }

      if (!payload?.userId || payload.guildId !== guildId) return;

      const queryKey = guildVoiceParticipantsQueryKey(guildId);

      // Кэша ещё нет — писать в него нечего, пусть запрос сходит сам.
      if (queryClient.getQueryData(queryKey) === undefined) {
        void queryClient.invalidateQueries({ queryKey });
        return;
      }

      if (type === "VOICE_PARTICIPANT_JOINED") {
        upsertVoiceParticipant(queryClient, payload);
      } else {
        removeVoiceParticipant(queryClient, payload);
      }
    };

    const handleSubscribed = () => {
      // За время разрыва мы могли пропустить события, поэтому после
      // переподключения состав перечитывается целиком.
      if (!isFirstSubscribe) {
        void queryClient.invalidateQueries({
          queryKey: guildVoiceParticipantsQueryKey(guildId),
        });
      }

      isFirstSubscribe = false;
    };

    sub.on("publication", handlePublication);
    sub.on("subscribed", handleSubscribed);

    sub.subscribe();

    // Снимаем только свои обработчики: на этот же канал подписан
    // useGuildChannelEvents, и removeAllListeners() убил бы и его тоже.
    return () => {
      sub.off("publication", handlePublication);
      sub.off("subscribed", handleSubscribed);
      sub.unsubscribe();
    };
  }, [centrifuge, guildId, queryClient]);
};
