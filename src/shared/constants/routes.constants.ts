export const ROUTES = {
  WELCOME: "/",
  AUTHORIZATION: "/login",
  SERVER: (serverId?: string) => `/server${serverId ? `/${serverId}` : ""}`,
  SERVER_SETTINGS: (serverId: string) => `/server/${serverId}/settings`,
  SETTINGS: "/settings",
} as const;

export const SETTINGS_TABS = {
  ACCOUNT: "account",
  AUDIO: "audio",
} as const;

export type SettingsTab = (typeof SETTINGS_TABS)[keyof typeof SETTINGS_TABS];

export const SETTINGS_TAB_PARAM = "tab";

export const parseSettingsTab = (value: string | null): SettingsTab =>
  value === SETTINGS_TABS.AUDIO ? SETTINGS_TABS.AUDIO : SETTINGS_TABS.ACCOUNT;

export const SERVER_SETTINGS_TABS = {
  GENERAL: "general",
  ROLES: "roles",
} as const;

export type ServerSettingsTab =
  (typeof SERVER_SETTINGS_TABS)[keyof typeof SERVER_SETTINGS_TABS];

export const parseServerSettingsTab = (
  value: string | null,
): ServerSettingsTab =>
  value === SERVER_SETTINGS_TABS.ROLES
    ? SERVER_SETTINGS_TABS.ROLES
    : SERVER_SETTINGS_TABS.GENERAL;
