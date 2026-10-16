import type { PermissionKey } from "./role.types";

export type PermissionDefinition = {
  key: PermissionKey;
  title: string;
  description: string;
};

export type PermissionGroup = {
  title: string;
  permissions: PermissionDefinition[];
};

export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    title: "Сервер",
    permissions: [
      {
        key: "MANAGE_GUILD",
        title: "Управлять сервером",
        description: "Менять название, описание и аватар сервера.",
      },
      {
        key: "MANAGE_ROLES",
        title: "Управлять ролями",
        description:
          "Создавать и удалять роли ниже своей, менять их права и участников.",
      },
      {
        key: "INVITE_MEMBERS",
        title: "Приглашать участников",
        description: "Отправлять приглашения на сервер.",
      },
      {
        key: "KICK_MEMBERS",
        title: "Исключать участников",
        description: "Удалять участников с сервера.",
      },
    ],
  },
  {
    title: "Текстовые каналы",
    permissions: [
      {
        key: "SEND_MESSAGES",
        title: "Отправлять сообщения",
        description: "Писать в текстовые каналы.",
      },
      {
        key: "ATTACH_FILES",
        title: "Прикреплять файлы",
        description: "Добавлять к сообщениям файлы и изображения.",
      },
      {
        key: "DELETE_MESSAGES",
        title: "Удалять чужие сообщения",
        description: "Удалять сообщения других участников.",
      },
    ],
  },
  {
    title: "Голосовые каналы",
    permissions: [
      {
        key: "VOICE_CONNECT",
        title: "Подключаться",
        description: "Заходить в голосовые каналы.",
      },
      {
        key: "VOICE_SPEAK",
        title: "Говорить",
        description: "Включать микрофон в голосовом канале.",
      },
      {
        key: "VOICE_MUTE_MEMBERS",
        title: "Отключать микрофон другим",
        description: "Выключать микрофон другим участникам канала.",
      },
    ],
  },
  {
    title: "Доски",
    permissions: [
      {
        key: "CREATE_BOARDS",
        title: "Создавать доски",
        description: "Добавлять новые доски на сервер.",
      },
      {
        key: "DELETE_BOARDS",
        title: "Удалять чужие доски",
        description: "Удалять доски, созданные другими участниками.",
      },
    ],
  },
];
