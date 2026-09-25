import { create } from "zustand";

export type VoiceConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting";

type VoiceState = {
  state: {
    guildId: string | null;
    channelId: string | null;
    channelName: string | null;
    status: VoiceConnectionStatus;
    isMicMuted: boolean;
    isDeafened: boolean;
    /** id говорящих прямо сейчас, приходит из LiveKit */
    speakingUserIds: string[];
    /** id тех, у кого микрофон выключен — своих и чужих */
    mutedUserIds: string[];
  };
  actions: {
    setConnecting: (
      guildId: string,
      channelId: string,
      channelName: string,
    ) => void;
    setConnected: () => void;
    setReconnecting: () => void;
    setDisconnected: () => void;
    setMicMuted: (isMicMuted: boolean) => void;
    setDeafened: (isDeafened: boolean) => void;
    setSpeakingUserIds: (speakingUserIds: string[]) => void;
    setMutedUserIds: (mutedUserIds: string[]) => void;
  };
};

const initialState: VoiceState["state"] = {
  guildId: null,
  channelId: null,
  channelName: null,
  status: "idle",
  isMicMuted: false,
  isDeafened: false,
  speakingUserIds: [],
  mutedUserIds: [],
};

/**
 * Голосовое подключение живёт отдельно от server.store намеренно: там
 * setActiveTextChannel и setActiveBoard держат инвариант «в центральной панели
 * ровно одна вьюха», а голос ортогонален — оставаясь в голосовом канале, можно
 * ходить по текстовым каналам, доскам и вообще по другим серверам.
 */
export const useVoiceStore = create<VoiceState>((set) => ({
  state: { ...initialState },
  actions: {
    setConnecting: (guildId, channelId, channelName) =>
      set((prev) => ({
        state: {
          ...prev.state,
          guildId,
          channelId,
          channelName,
          status: "connecting",
        },
      })),
    setConnected: () =>
      set((prev) => ({
        state: { ...prev.state, status: "connected" },
      })),
    setReconnecting: () =>
      set((prev) => ({
        state: { ...prev.state, status: "reconnecting" },
      })),
    // Сбрасываем и флаги микрофона: следующее подключение начинается «с чистого
    // листа», иначе пользователь молча войдёт в канал с выключенным микрофоном.
    setDisconnected: () => set(() => ({ state: { ...initialState } })),
    setMicMuted: (isMicMuted) =>
      set((prev) => ({
        state: { ...prev.state, isMicMuted },
      })),
    setDeafened: (isDeafened) =>
      set((prev) => ({
        state: { ...prev.state, isDeafened },
      })),
    setSpeakingUserIds: (speakingUserIds) =>
      set((prev) => ({
        state: { ...prev.state, speakingUserIds },
      })),
    setMutedUserIds: (mutedUserIds) =>
      set((prev) => ({
        state: { ...prev.state, mutedUserIds },
      })),
  },
}));
