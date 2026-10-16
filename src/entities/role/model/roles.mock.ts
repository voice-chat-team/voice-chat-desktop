import type { GuildRole, PermissionKey, RoleMember } from "./role.types";

// Временные данные для вёрстки страницы настроек — заменятся запросами,
// когда в services.guilds появятся роли.

const allow = (...keys: PermissionKey[]): Record<PermissionKey, boolean> => {
  const all: PermissionKey[] = [
    "MANAGE_GUILD",
    "MANAGE_ROLES",
    "INVITE_MEMBERS",
    "KICK_MEMBERS",
    "SEND_MESSAGES",
    "ATTACH_FILES",
    "DELETE_MESSAGES",
    "VOICE_CONNECT",
    "VOICE_SPEAK",
    "VOICE_MUTE_MEMBERS",
    "CREATE_BOARDS",
    "DELETE_BOARDS",
  ];

  return Object.fromEntries(
    all.map((key) => [key, keys.includes(key)]),
  ) as Record<PermissionKey, boolean>;
};

const MEMBERS: RoleMember[] = [
  { id: "mock-1", username: "anya.k" },
  { id: "mock-2", username: "dmitry" },
  { id: "mock-3", username: "lisa_draws" },
  { id: "mock-4", username: "max.petrov" },
  { id: "mock-5", username: "sonya" },
  { id: "mock-6", username: "timur" },
];

export const MOCK_GUILD_ROLES: GuildRole[] = [
  {
    id: "role-everyone",
    name: "@everyone",
    color: "#a1a1aa",
    isDefault: true,
    members: MEMBERS,
    permissions: allow(
      "SEND_MESSAGES",
      "ATTACH_FILES",
      "VOICE_CONNECT",
      "VOICE_SPEAK",
      "CREATE_BOARDS",
    ),
  },
  {
    id: "role-moderator",
    name: "Модератор",
    color: "#60a5fa",
    members: MEMBERS.slice(0, 2),
    permissions: allow(
      "INVITE_MEMBERS",
      "KICK_MEMBERS",
      "SEND_MESSAGES",
      "ATTACH_FILES",
      "DELETE_MESSAGES",
      "VOICE_CONNECT",
      "VOICE_SPEAK",
      "VOICE_MUTE_MEMBERS",
      "CREATE_BOARDS",
      "DELETE_BOARDS",
    ),
  },
  {
    id: "role-artists",
    name: "Художники",
    color: "#f472b6",
    members: MEMBERS.slice(2, 5),
    permissions: allow("SEND_MESSAGES", "ATTACH_FILES", "CREATE_BOARDS"),
  },
  {
    id: "role-guests",
    name: "Гости",
    color: "#facc15",
    members: [],
    permissions: allow("SEND_MESSAGES"),
  },
];
