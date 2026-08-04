export const ROUTES = {
  WELCOME: "/",
  AUTHORIZATION: "/login",
  SERVER: (serverId?: string) => `/server${serverId ? `/${serverId}` : ""}`,
  SETTINGS: "/settings",
} as const;
