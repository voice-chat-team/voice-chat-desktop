export const ROUTES = {
  WELCOME: "/",
  AUTHORIZATION: "/login",
  SERVER: (serverId?: string) => `/server${serverId ? `/${serverId}` : ""}`,
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
