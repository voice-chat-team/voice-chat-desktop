import { guildApi } from "@/shared";
import { useSuspenseQuery, type QueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import type { GetGuildMembersResponseDto } from "@/shared/api/generated/models/get-guild-members-response-dto";
import type { GuildMemberDto } from "@/shared/api/generated/models/guild-member-dto";

export const guildMembersQueryKey = (guildId: string) => [
  "get-guild-members",
  guildId,
];

export const useGuildMembers = (guildId: string) => {
  return useSuspenseQuery({
    queryKey: guildMembersQueryKey(guildId),
    queryFn: async () => await guildApi.guildControllerGetGuildMembers(guildId),
    select: (data) => data.data.members,
    staleTime: 60_000,
  });
};

type MembersCache = AxiosResponse<GetGuildMembersResponseDto> | undefined;

const updateMembers = (
  queryClient: QueryClient,
  guildId: string,
  update: (members: GuildMemberDto[]) => GuildMemberDto[],
) => {
  queryClient.setQueryData(
    guildMembersQueryKey(guildId),
    (old: MembersCache) =>
      old && {
        ...old,
        data: { ...old.data, members: update(old.data.members) },
      },
  );
};

/** Заменяет участников по userId (новых добавляет в конец). */
export const upsertGuildMembers = (
  queryClient: QueryClient,
  guildId: string,
  members: GuildMemberDto[],
) => {
  const byUserId = new Map(members.map((m) => [m.userId, m]));

  updateMembers(queryClient, guildId, (current) => {
    const known = new Set(current.map((m) => m.userId));
    const added = members.filter((m) => !known.has(m.userId));

    return [
      ...current.map((m) => byUserId.get(m.userId) ?? m),
      ...added,
    ];
  });
};

export const removeGuildMember = (
  queryClient: QueryClient,
  guildId: string,
  userId: string,
) => {
  updateMembers(queryClient, guildId, (current) =>
    current.filter((m) => m.userId !== userId),
  );
};

/** Удалённая роль пропадает у всех участников. */
export const removeRoleFromGuildMembers = (
  queryClient: QueryClient,
  guildId: string,
  roleId: string,
) => {
  updateMembers(queryClient, guildId, (current) =>
    current.map((m) =>
      m.roleIds.includes(roleId)
        ? { ...m, roleIds: m.roleIds.filter((id) => id !== roleId) }
        : m,
    ),
  );
};
