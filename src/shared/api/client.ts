// Regenerate with: bun run codegen

import axios from "axios";
import { Configuration } from "./generated/configuration";
import { AuthApi, GuildApi, UserApi } from "./generated";

const TOKEN_KEY = "access_token";

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

const axiosInstance = axios.create({
  baseURL: "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAccessToken();
      // Optionally redirect to login
      // window.location.href = "/authorization";
    }
    return Promise.reject(error);
  },
);

const config = new Configuration({
  basePath: "http://localhost:3000",
});

export const authApi = new AuthApi(config, undefined, axiosInstance);
export const guildApi = new GuildApi(config, undefined, axiosInstance);
export const userApi = new UserApi(config, undefined, axiosInstance);
