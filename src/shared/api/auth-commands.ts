import { invoke } from "@tauri-apps/api/core";

let cachedAccessToken: string | null = null;
let cachedHasToken: boolean | null = null;

export async function login(email: string, password: string): Promise<void> {
  await invoke("login", { email, password });
  cachedAccessToken = null;
  cachedHasToken = true;
}

export async function logout(): Promise<void> {
  await invoke("logout");
  cachedAccessToken = null;
  cachedHasToken = false;
}

export async function getAccessToken(): Promise<string | null> {
  if (cachedAccessToken) return cachedAccessToken;
  try {
    cachedAccessToken = await invoke<string>("get_access_token");
    return cachedAccessToken;
  } catch {
    return null;
  }
}

export async function hasToken(): Promise<boolean> {
  if (cachedHasToken !== null) return cachedHasToken;
  try {
    cachedHasToken = await invoke<boolean>("has_token");
    return cachedHasToken;
  } catch {
    return false;
  }
}

export async function refreshAccessToken(): Promise<string> {
  try {
    const token = await invoke<string>("refresh_access_token");
    cachedAccessToken = token;
    cachedHasToken = true;
    return token;
  } catch (error) {
    cachedAccessToken = null;
    cachedHasToken = false;
    throw error;
  }
}
