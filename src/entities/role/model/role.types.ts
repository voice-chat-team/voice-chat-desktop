import type { PermissionKey } from "@/shared";

export type { PermissionKey };

export type RoleMember = {
  id: string;
  username: string;
  avatarUrl?: string;
};

/**
 * Роль в редакторе настроек: RoleDto с участниками. Порядок в списке ролей —
 * иерархия сверху вниз, @everyone последняя.
 */
export type GuildRole = {
  id: string;
  name: string;
  /** Цвет имени участника в чате и списках, hex. */
  color: string;
  /** Позиция на сервере; у ещё не сохранённой роли — 0. */
  position: number;
  members: RoleMember[];
  permissions: PermissionKey[];
  /** Роль по умолчанию: есть у всех участников, её нельзя переименовать и удалить. */
  isDefault?: boolean;
  /** Создана в редакторе и ещё не сохранена. */
  isNew?: boolean;
};
