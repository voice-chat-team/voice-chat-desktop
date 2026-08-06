import { GetGuildMembersResponseDto } from "@/shared";
import { useCentrifuge } from "@/shared/lib";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useEffect } from "react";

export const useGuildChannelEvents = (guildId: string) => {
  const queryClient = useQueryClient();
  const centrifuge = useCentrifuge();

  useEffect(() => {
    if (!centrifuge) return;

    const channel = `guild:${guildId}`;

    const sub =
      centrifuge.getSubscription(channel) ??
      centrifuge.newSubscription(channel);

    sub.on("publication", (ctx) => {
      console.log(ctx);
      const member = ctx.data.payload.notificationPayload.member;
      queryClient.setQueryData(
        ["get-guild-members", guildId],
        (old: AxiosResponse<GetGuildMembersResponseDto> | undefined) => {
          if (!old) return old;
          return {
            ...old,
            data: {
              ...old.data,
              members: [...old.data.members, member],
            },
          };
        },
      );
    });

    sub.subscribe();

    return () => {
      sub.unsubscribe();
      sub.removeAllListeners();
    };
  }, [centrifuge, guildId]);
};
