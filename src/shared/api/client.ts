import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { Configuration } from "./generated/configuration";
import {
  AuthApi,
  GuildApi,
  UserApi,
  InvitationApi,
  NotificationApi,
  MessageApi,
  VoiceApi,
} from "./generated";
import { getAccessToken, refreshAccessToken } from "./auth-commands";

const BASE_URL = "https://api.voice-chat-app.ru";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string> | null = null;

function refreshToken(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

// ── Configuration ───────────────────────────────────────────────────

const config = new Configuration({
  basePath: BASE_URL,
});

// ── API instances ───────────────────────────────────────────────────

export const authApi = new AuthApi(config, undefined, axiosInstance);
export const guildApi = new GuildApi(config, undefined, axiosInstance);
export const userApi = new UserApi(config, undefined, axiosInstance);
export const inviteApi = new InvitationApi(config, undefined, axiosInstance);
export const notificationApi = new NotificationApi(
  config,
  undefined,
  axiosInstance,
);
export const messageApi = new MessageApi(config, undefined, axiosInstance);
export const voiceApi = new VoiceApi(config, undefined, axiosInstance);
