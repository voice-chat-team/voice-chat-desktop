import { useSuspenseQuery } from "@tanstack/react-query";
import { ServerAsideMembersList } from "./ServerAsideMembersList";
import { guildApi } from "@/shared";
import { useServerStore } from "@/entities/server";

export const ServerAsideMembersListContainer = () => {
  const guild = useServerStore((s) => s.state.guild);

  const { data: members } = useSuspenseQuery({
    queryKey: ["get-guild-members", guild!.id],
    queryFn: async () =>
      await guildApi.guildControllerGetGuildMembers(guild!.id),
    select: (data) => data.data.members,
  });

  return <ServerAsideMembersList members={members ?? []} />;
};
