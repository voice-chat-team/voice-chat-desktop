import { PermissionKey, type GuildMemberDto, type RoleDto } from "@/shared";

// Те же правила, что в services.guilds: сервер всё равно проверяет сам,
// здесь — только чтобы не показывать действия, которые он отклонит.

export const ALL_PERMISSION_KEYS = Object.values(PermissionKey);

type MemberLike = Pick<GuildMemberDto, "isGuildOwner" | "isBanned" | "roleIds">;

/**
 * Права участника считаем сами из ролей, а не берём member.permissions:
 * после ROLE_UPDATED роли в кэше уже новые, а участники — со старыми правами.
 */
export const resolveMemberPermissions = (
  member: MemberLike,
  roles: readonly RoleDto[],
): Set<PermissionKey> => {
  if (member.isGuildOwner) return new Set(ALL_PERMISSION_KEYS);
  if (member.isBanned) return new Set();

  const own = new Set(member.roleIds);

  return new Set(
    roles
      .filter((role) => role.isDefault || own.has(role.id))
      .flatMap((role) => role.permissions),
  );
};

/** Позиция высшей роли: у владельца — бесконечность, без ролей — 0. */
export const getTopPosition = (
  member: MemberLike,
  roles: readonly RoleDto[],
): number => {
  if (member.isGuildOwner) return Number.POSITIVE_INFINITY;

  const own = new Set(member.roleIds);

  return roles.reduce(
    (top, role) => (own.has(role.id) ? Math.max(top, role.position) : top),
    0,
  );
};

/** Цвет ника — цвет высшей роли участника; без ролей — undefined. */
export const getMemberRoleColor = (
  member: Pick<GuildMemberDto, "roleIds"> | undefined,
  roles: readonly RoleDto[],
): string | undefined => {
  if (!member?.roleIds.length) return undefined;

  const own = new Set(member.roleIds);

  // roles уже по убыванию позиции.
  return roles.find((role) => !role.isDefault && own.has(role.id))?.color;
};
