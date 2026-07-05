// API client — single point of configuration for all generated APIs.
// Tokens persist to disk via tauri-plugin-store.
//
// Usage:
//   import { authApi, guildApi, userApi, tokenStore } from "@/shared/api/client";
//
// Regenerate: bun run codegen

import axios from "axios";
import { Store } from "@tauri-apps/plugin-store";
import { Configuration } from "./generated/configuration";
import { AuthApi, GuildApi, UserApi } from "./generated";

// ── Tauri Store ─────────────────────────────────────────────────────

const STORE_PATH = "tokens.json";
let storeInstance: Store | null = null;

async function getStore(): Promise<Store> {
  if (!storeInstance) {
    storeInstance = await Store.load(STORE_PATH);
  }
  return storeInstance;
}

export const tokenStore = {
  async getAccessToken(): Promise<string | null> {
    const store = await getStore();
    return (await store.get<string>("accessToken")) ?? null;
  },

  async getRefreshToken(): Promise<string | null> {
    const store = await getStore();
    return (await store.get<string>("refreshToken")) ?? null;
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    const store = await getStore();
    await store.set("accessToken", accessToken);
    await store.set("refreshToken", refreshToken);
    await store.save();
  },

  async clear(): Promise<void> {
    const store = await getStore();
    await store.delete("accessToken");
    await store.delete("refreshToken");
    await store.save();
  },
};

// ── Axios instance ──────────────────────────────────────────────────

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

// ── Token refresh ───────────────────────────────────────────────────

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else if (token) {
      resolve(token);
    }
  });
  failedQueue = [];
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await tokenStore.getRefreshToken();
      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      await tokenStore.setTokens(data.accessToken, data.refreshToken);
      processQueue(null, data.accessToken);
      isRefreshing = false;

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      await tokenStore.clear();
      return Promise.reject(refreshError);
    }
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
