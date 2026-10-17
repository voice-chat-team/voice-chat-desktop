import type { GuildRole, RoleMember } from "@/entities/role";
import { guildRoleApi, type GuildMemberDto, type RoleDto } from "@/shared";

const toRoleMember = (member: GuildMemberDto): RoleMember => ({
  id: member.userId,
  username: member.user.username,
  avatarUrl: member.user.avatarUrl || undefined,
});

/** Роли сервера с участниками — в том же порядке, что и roles (сверху вниз). */
export const buildGuildRoles = (
  roles: RoleDto[],
  members: GuildMemberDto[],
): GuildRole[] =>
  roles.map((role) => ({
    id: role.id,
    name: role.name,
    color: role.color,
    position: role.position,
    isDefault: role.isDefault,
    permissions: role.permissions,
    members: (role.isDefault
      ? members
      : members.filter((m) => m.roleIds.includes(role.id))
    ).map(toRoleMember),
  }));

const sameList = (a: readonly string[], b: readonly string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

/**
 * Отправляет разницу между base (серверное состояние на момент начала правок)
 * и next. Сравнение с base, а не с текущим кэшем: правки, которые за это время
 * сделал кто-то другой и которых этот пользователь не трогал, не откатываются.
 * Возвращает соответствие временных id новых ролей настоящим.
 */
export const saveRoleChanges = async (
  guildId: string,
  base: GuildRole[],
  next: GuildRole[],
): Promise<Map<string, string>> => {
  const baseById = new Map(base.map((role) => [role.id, role]));
  const nextIds = new Set(next.map((role) => role.id));
  const createdIds = new Map<string, string>();

  for (const role of base) {
    if (!role.isDefault && !nextIds.has(role.id)) {
      await guildRoleApi.guildRoleControllerDeleteRole({
        guildId,
        roleId: role.id,
      });
    }
  }

  // Сервер ставит каждую новую роль в самый низ — так же ведём порядок здесь,
  // чтобы понять, нужен ли потом запрос перестановки.
  const serverOrder = base
    .filter((role) => !role.isDefault && nextIds.has(role.id))
    .map((role) => role.id);

  for (const role of next) {
    if (!role.isNew) continue;

    const { data } = await guildRoleApi.guildRoleControllerCreateRole({
      guildId,
      name: role.name.trim(),
      color: role.color,
      permissions: role.permissions,
    });

    createdIds.set(role.id, data.role.id);
    serverOrder.push(data.role.id);
  }

  for (const role of next) {
    const before = baseById.get(role.id);
    if (role.isNew || !before) continue;

    const name = role.name.trim();
    const patch = {
      ...(!role.isDefault && name !== before.name && { name }),
      ...(role.color !== before.color && { color: role.color }),
      ...(!sameList(role.permissions, before.permissions) && {
        permissions: role.permissions,
      }),
    };

    if (Object.keys(patch).length) {
      await guildRoleApi.guildRoleControllerUpdateRole({
        guildId,
        roleId: role.id,
        ...patch,
      });
    }
  }

  const desiredOrder = next
    .filter((role) => !role.isDefault)
    .map((role) => createdIds.get(role.id) ?? role.id);

  if (!sameList(desiredOrder, serverOrder)) {
    await guildRoleApi.guildRoleControllerReorderRoles({
      guildId,
      roleIds: desiredOrder,
    });
  }

  for (const role of next) {
    if (role.isDefault) continue;

    const roleId = createdIds.get(role.id) ?? role.id;
    const before = new Set(baseById.get(role.id)?.members.map((m) => m.id));
    const after = new Set(role.members.map((m) => m.id));

    const added = [...after].filter((id) => !before.has(id));
    const removed = [...before].filter((id) => !after.has(id));

    if (added.length) {
      await guildRoleApi.guildRoleControllerAddRoleMembers({
        guildId,
        roleId,
        targetUserIds: added,
      });
    }

    if (removed.length) {
      await guildRoleApi.guildRoleControllerRemoveRoleMembers({
        guildId,
        roleId,
        targetUserIds: removed,
      });
    }
  }

  return createdIds;
};
