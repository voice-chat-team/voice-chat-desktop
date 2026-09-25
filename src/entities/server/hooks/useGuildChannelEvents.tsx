import { GetGuildMembersResponseDto, type GuildMemberDto } from "@/shared";
import { useCentrifuge } from "@/shared/lib";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useEffect } from "react";

type GuildMemberEvent = {
  type?: string;
  payload?: {
    notificationPayload?: {
      member?: GuildMemberDto;
    };
  };
};

export const useGuildChannelEvents = (guildId: string) => {
  const queryClient = useQueryClient();
  const centrifuge = useCentrifuge();

  useEffect(() => {
    if (!centrifuge) return;

    const channel = `guild:${guildId}`;

    const sub =
      centrifuge.getSubscription(channel) ??
      centrifuge.newSubscription(channel);

    // В этот же канал сервис голоса шлёт VOICE_PARTICIPANT_*, у которых
    // совсем другая форма payload, поэтому смотрим на type и берём только своё.
    const handlePublication = (ctx: { data?: unknown }) => {
      const { type, payload } = (ctx.data ?? {}) as GuildMemberEvent;

      if (type !== "GUILD_MEMBER_ADD") return;

      const member = payload?.notificationPayload?.member;
      if (!member) return;

      queryClient.setQueryData(
        ["get-guild-members", guildId],
        (old: AxiosResponse<GetGuildMembersResponseDto> | undefined) => {
          if (!old) return old;

          // Событие может продублироваться при переподписке.
          if (old.data.members.some((m) => m.userId === member.userId)) {
            return old;
          }

          return {
            ...old,
            data: {
              ...old.data,
              members: [...old.data.members, member],
            },
          };
        },
      );
    };

    sub.on("publication", handlePublication);

    sub.subscribe();

    // Снимаем только свой обработчик: на этот же канал подписан
    // useGuildVoiceEvents, и removeAllListeners() убил бы и его тоже.
    return () => {
      sub.off("publication", handlePublication);
      sub.unsubscribe();
    };
  }, [centrifuge, guildId, queryClient]);
};
