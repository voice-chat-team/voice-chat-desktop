import type { AxiosResponse } from "axios";
import { guildApi, useCentrifuge } from "@/shared";
import type { GetGuildMembersResponseDto } from "@/shared/api/generated";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const useGuildMembers = (guildId: string) => {
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

  return useSuspenseQuery({
    queryKey: ["get-guild-members", guildId],
    queryFn: async () => await guildApi.guildControllerGetGuildMembers(guildId),
    select: (data) => data.data.members,
    staleTime: 60_000,
  });
};
