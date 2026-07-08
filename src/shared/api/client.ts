import axios from "axios";
import { Store } from "@tauri-apps/plugin-store";
import { Configuration } from "./generated/configuration";
import { AuthApi, GuildApi, UserApi } from "./generated";

// ── Tauri Store ─────────────────────────────────────────────────────

const STORE_PATH = "tokens.json";

let storeInstance: Store | null = null;
let cachedAccessToken: string | null | undefined;
let cachedRefreshToken: string | null | undefined;

async function getStore(): Promise<Store> {
  if (!storeInstance) {
    storeInstance = await Store.load(STORE_PATH);
  }
  return storeInstance;
}

export const tokenStore = {
  /** Force re-read from disk. Call once on app startup. */
  async init(): Promise<void> {
    const store = await getStore();
    cachedAccessToken = (await store.get<string>("accessToken")) ?? null;
    cachedRefreshToken = (await store.get<string>("refreshToken")) ?? null;
  },

  async getAccessToken(): Promise<string | null> {
    if (!!cachedAccessToken) return cachedAccessToken;
    const store = await getStore();
    cachedAccessToken = (await store.get<string>("accessToken")) ?? null;
    return cachedAccessToken;
  },

  async getRefreshToken(): Promise<string | null> {
    if (!!cachedRefreshToken) return cachedRefreshToken;
    const store = await getStore();
    cachedRefreshToken = (await store.get<string>("refreshToken")) ?? null;
    return cachedRefreshToken;
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    cachedAccessToken = accessToken;
    cachedRefreshToken = refreshToken;
    const store = await getStore();
    await store.set("accessToken", accessToken);
    await store.set("refreshToken", refreshToken);
    await store.save();
  },

  async clear(): Promise<void> {
    cachedAccessToken = null;
    cachedRefreshToken = null;
    const store = await getStore();
    await store.delete("accessToken");
    await store.delete("refreshToken");
    await store.save();
  },
};

const BASE_URL = "https://api.voice-chat-app.ru";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(async (config) => {
  const token = await tokenStore.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing
    ) {
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = await tokenStore.getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await authApi.authControllerRefreshToken({
          refreshToken,
        });
        await tokenStore.setTokens(data.accessToken, data.refreshToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        } else {
          originalRequest.headers = {
            Authorization: `Bearer ${data.accessToken}`,
          };
        }

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        await tokenStore.clear();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
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
