import { useSuspenseQuery } from "@tanstack/react-query";
import { ServerAsideMembersList } from "./ServerAsideMembersList";
import { guildApi } from "@/shared";
import { useServerStore } from "@/entities/server";

export const ServerAsideMembersListContainer = () => {
  const guild = useServerStore((s) => s.guild);

  const { data: members } = useSuspenseQuery({
    queryKey: ["get-guild-members", guild!.id],
    queryFn: async () => {
      const { data } = await guildApi.guildControllerGetGuildMembers(guild!.id);
      return data.members;
    },
  });

  return <ServerAsideMembersList members={members} />;
};
