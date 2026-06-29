import { useGuildMembers } from "@/shared";
import { ServerAsideMembersList } from "./ServerAsideMembersList";
import { useServerStore } from "@/entities/server";

export const ServerAsideMembersListContainer = () => {
  const guild = useServerStore((s) => s.state.guild);

  if (!guild) return null;

  const { data: members } = useGuildMembers(guild.id);

  return <ServerAsideMembersList members={members ?? []} />;
};
