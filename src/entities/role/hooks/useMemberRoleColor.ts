import { useCallback, useMemo } from "react";

import { useGuildMembers, useGuildRoles } from "@/shared";

import { getMemberRoleColor } from "../lib/permissions";

/** userId → цвет ника по высшей роли (undefined — обычный цвет текста). */
export const useMemberRoleColor = (guildId: string) => {
  const { data: members } = useGuildMembers(guildId);
  const { data: roles } = useGuildRoles(guildId);

  const byUserId = useMemo(
    () => new Map(members.map((m) => [m.userId, m])),
    [members],
  );

  return useCallback(
    (userId: string) => getMemberRoleColor(byUserId.get(userId), roles),
    [byUserId, roles],
  );
};
