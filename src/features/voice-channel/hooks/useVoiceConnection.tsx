import { useCallback } from "react";
import { toast } from "sonner";

import { useServerStore } from "@/entities/server";
import { useVoiceStore } from "@/entities/voice";
import {
  connectToVoiceChannel,
  disconnectFromVoiceChannel,
  MicrophoneUnavailableError,
  setDeafened,
  setMicrophoneMuted,
  setSpeakerphoneEnabled,
} from "../model/voice-room";

export const useVoiceConnection = () => {
  const status = useVoiceStore((store) => store.state.status);
  const channelId = useVoiceStore((store) => store.state.channelId);
  const isMicMuted = useVoiceStore((store) => store.state.isMicMuted);
  const isDeafened = useVoiceStore((store) => store.state.isDeafened);
  const isSpeakerphone = useVoiceStore((store) => store.state.isSpeakerphone);

  const join = useCallback(
    async (guildId: string, targetChannelId: string, channelName: string) => {
      try {
        await connectToVoiceChannel(guildId, targetChannelId, channelName);
      } catch (error) {
        console.error(error);

        if (error instanceof MicrophoneUnavailableError) {
          toast.error("Не удалось включить микрофон", {
            description: "Вы в канале, но вас не слышно",
          });
          return;
        }

        toast.error("Не удалось подключиться к голосовому каналу");
      }
    },
    [],
  );

  const leave = useCallback(async () => {
    // Выход из разговора — явное действие пользователя, поэтому закрываем и
    // сцену. При неожиданном обрыве она остаётся открытой с кнопкой
    // «Подключиться»: так понятнее, что произошло.
    if (useServerStore.getState().state.activeVoiceChannel) {
      useServerStore.getState().actions.setActiveVoiceChannel(null);
    }

    await disconnectFromVoiceChannel();
  }, []);

  const toggleMic = useCallback(async () => {
    try {
      await setMicrophoneMuted(!useVoiceStore.getState().state.isMicMuted);
    } catch (error) {
      console.error(error);
      toast.error("Не удалось переключить микрофон");
    }
  }, []);

  const toggleDeafen = useCallback(async () => {
    try {
      await setDeafened(!useVoiceStore.getState().state.isDeafened);
    } catch (error) {
      console.error(error);
      toast.error("Не удалось переключить звук");
    }
  }, []);

  const toggleSpeakerphone = useCallback(() => {
    setSpeakerphoneEnabled(!useVoiceStore.getState().state.isSpeakerphone);
  }, []);

  return {
    status,
    channelId,
    isMicMuted,
    isDeafened,
    isSpeakerphone,
    toggleSpeakerphone,
    isConnected: status === "connected",
    join,
    leave,
    toggleMic,
    toggleDeafen,
  };
};
