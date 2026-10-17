import { useMemo } from "react";

import {
  useCurrentUser,
  useGuildMembers,
  useGuildRoles,
  type PermissionKey,
} from "@/shared";

import {
  getTopPosition,
  resolveMemberPermissions,
} from "../lib/permissions";

export type GuildPermissions = {
  isOwner: boolean;
  /** Позиция высшей роли текущего пользователя. */
  topPosition: number;
  has: (permission: PermissionKey) => boolean;
  /** Можно ли менять роль с такой позицией (имя, цвет, права, участников). */
  canManageRole: (role: { position: number; isDefault?: boolean }) => boolean;
  /** Можно ли исключить участника с такой высшей позицией. */
  canKick: (member: {
    userId: string;
    isGuildOwner: boolean;
    roleIds: string[];
  }) => boolean;
};

/** Права текущего пользователя на сервере. Работает внутри Suspense. */
export const useGuildPermissions = (guildId: string): GuildPermissions => {
  const { data: members } = useGuildMembers(guildId);
  const { data: roles } = useGuildRoles(guildId);
  const { data: currentUser } = useCurrentUser();

  return useMemo(() => {
    const self = members.find((m) => m.userId === currentUser?.id);
    const permissions = self
      ? resolveMemberPermissions(self, roles)
      : new Set<PermissionKey>();
    const isOwner = Boolean(self?.isGuildOwner);
    const topPosition = self ? getTopPosition(self, roles) : 0;
    const has = (permission: PermissionKey) => permissions.has(permission);

    return {
      isOwner,
      topPosition,
      has,
      canManageRole: (role) =>
        has("MANAGE_ROLES") &&
        (isOwner || role.isDefault === true || role.position < topPosition),
      canKick: (member) =>
        has("KICK_MEMBERS") &&
        !member.isGuildOwner &&
        member.userId !== currentUser?.id &&
        (isOwner ||
          getTopPosition({ ...member, isBanned: false }, roles) < topPosition),
    };
  }, [members, roles, currentUser?.id]);
};
