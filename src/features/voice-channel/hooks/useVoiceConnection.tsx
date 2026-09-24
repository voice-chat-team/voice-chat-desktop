import { useCallback } from "react";
import { toast } from "sonner";

import { useVoiceStore } from "@/entities/voice";
import {
  connectToVoiceChannel,
  disconnectFromVoiceChannel,
  setDeafened,
  setMicrophoneMuted,
} from "../model/voice-room";

export const useVoiceConnection = () => {
  const status = useVoiceStore((store) => store.state.status);
  const channelId = useVoiceStore((store) => store.state.channelId);
  const isMicMuted = useVoiceStore((store) => store.state.isMicMuted);
  const isDeafened = useVoiceStore((store) => store.state.isDeafened);

  const join = useCallback(
    async (guildId: string, targetChannelId: string, channelName: string) => {
      try {
        await connectToVoiceChannel(guildId, targetChannelId, channelName);
      } catch (error) {
        console.error(error);
        toast.error("Не удалось подключиться к голосовому каналу");
      }
    },
    [],
  );

  const leave = useCallback(async () => {
    await disconnectFromVoiceChannel();
  }, []);

  const toggleMic = useCallback(async () => {
    await setMicrophoneMuted(!useVoiceStore.getState().state.isMicMuted);
  }, []);

  const toggleDeafen = useCallback(async () => {
    await setDeafened(!useVoiceStore.getState().state.isDeafened);
  }, []);

  return {
    status,
    channelId,
    isMicMuted,
    isDeafened,
    isConnected: status === "connected",
    join,
    leave,
    toggleMic,
    toggleDeafen,
  };
};
