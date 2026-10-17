import { useSuspenseQuery, type QueryClient } from "@tanstack/react-query";

import { guildRoleApi } from "@/shared/api/client";
import type { RoleDto } from "@/shared/api/generated/models/role-dto";

export const guildRolesQueryKey = (guildId: string) => ["guild-roles", guildId];

/**
 * Роли сервера по убыванию позиции, @everyone последняя. Изменения другими
 * участниками приходят событиями ROLE_* в guild:{guildId} и пишутся в кэш.
 */
export const useGuildRoles = (guildId: string) =>
  useSuspenseQuery({
    queryKey: guildRolesQueryKey(guildId),
    queryFn: async ({ signal }) => {
      const { data } = await guildRoleApi.guildRoleControllerGetRoles(
        guildId,
        { signal },
      );

      return data.roles ?? [];
    },
    staleTime: 60_000,
  });

const byPositionDesc = (a: RoleDto, b: RoleDto) => b.position - a.position;

export const setGuildRoles = (
  queryClient: QueryClient,
  guildId: string,
  roles: RoleDto[],
) => {
  queryClient.setQueryData(
    guildRolesQueryKey(guildId),
    [...roles].sort(byPositionDesc),
  );
};

export const upsertGuildRole = (queryClient: QueryClient, role: RoleDto) => {
  queryClient.setQueryData(
    guildRolesQueryKey(role.guildId),
    (old: RoleDto[] | undefined) => {
      if (!old) return old;

      const exists = old.some((r) => r.id === role.id);
      const next = exists
        ? old.map((r) => (r.id === role.id ? role : r))
        : [...old, role];

      return next.sort(byPositionDesc);
    },
  );
};
