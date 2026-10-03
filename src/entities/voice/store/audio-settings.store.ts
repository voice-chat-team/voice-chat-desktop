import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AudioSettingsStore = {
  state: {
    inputDeviceId: string;
    outputDeviceId: string;
  };
  actions: {
    setInputDeviceId: (deviceId: string) => void;
    setOutputDeviceId: (deviceId: string) => void;
  };
};

const initialState: AudioSettingsStore["state"] = {
  inputDeviceId: "default",
  outputDeviceId: "default",
};

export const useAudioSettingsStore = create<AudioSettingsStore>()(
  persist(
    (set) => ({
      state: { ...initialState },
      actions: {
        setInputDeviceId: (inputDeviceId) =>
          set((prev) => ({ state: { ...prev.state, inputDeviceId } })),
        setOutputDeviceId: (outputDeviceId) =>
          set((prev) => ({ state: { ...prev.state, outputDeviceId } })),
      },
    }),
    {
      name: "voice-chat:audio-settings",
      partialize: ({ state }) => ({ state }),
      merge: (persisted, current) => ({
        ...current,
        state: {
          ...current.state,
          ...(persisted as Partial<Pick<AudioSettingsStore, "state">>)?.state,
        },
      }),
    },
  ),
);
