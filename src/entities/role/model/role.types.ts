// Роли пока существуют только на клиенте: на бэкенде нет ни ролей, ни прав,
// единственная «роль» — флаг isGuildOwner у участника.

export type PermissionKey =
  | "MANAGE_GUILD"
  | "MANAGE_ROLES"
  | "INVITE_MEMBERS"
  | "KICK_MEMBERS"
  | "SEND_MESSAGES"
  | "ATTACH_FILES"
  | "DELETE_MESSAGES"
  | "VOICE_CONNECT"
  | "VOICE_SPEAK"
  | "VOICE_MUTE_MEMBERS"
  | "CREATE_BOARDS"
  | "DELETE_BOARDS";

export type RoleMember = {
  id: string;
  username: string;
};

export type GuildRole = {
  id: string;
  name: string;
  /** Цвет имени участника в чате и списках, hex. */
  color: string;
  members: RoleMember[];
  permissions: Record<PermissionKey, boolean>;
  /** Роль по умолчанию: есть у всех участников, её нельзя переименовать и удалить. */
  isDefault?: boolean;
};
