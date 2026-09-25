import {
  Headphones,
  HeadphoneOff,
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
} from "lucide-react";

import { useVoiceStore } from "@/entities/voice";
import {
  Avatar,
  AvatarFallback,
  Button,
  createAbbr,
  useCurrentUser,
} from "@/shared";
import { useVoiceConnection } from "../hooks/useVoiceConnection";

export const VoiceControlPanel = () => {
  const { data: user } = useCurrentUser();

  const status = useVoiceStore((store) => store.state.status);
  const channelName = useVoiceStore((store) => store.state.channelName);
  const { isMicMuted, isDeafened, leave, toggleMic, toggleDeafen } =
    useVoiceConnection();

  if (status === "idle") return null;

  const statusTitle =
    status === "connected"
      ? (channelName ?? "Голосовой канал")
      : status === "reconnecting"
        ? "Переподключение…"
        : "Подключение…";

  return (
    <div className="pt-3 flex flex-col gap-2.5">
      <div className="flex items-center gap-1.5 text-sm text-secondary/70 truncate">
        <Volume2 size={15} />
        <span className="truncate">{statusTitle}</span>
      </div>

      <div className="flex justify-between">
        <div className="flex items-center gap-2 truncate">
          <Avatar>
            <AvatarFallback className="font-medium">
              {createAbbr(user?.username ?? "", 1)}
            </AvatarFallback>
          </Avatar>
          <p className="truncate">{user?.username}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            title={isDeafened ? "Включить звук" : "Выключить звук"}
            aria-label={isDeafened ? "Включить звук" : "Выключить звук"}
            onClick={() => void toggleDeafen()}
            className="cursor-pointer h-8 w-8"
          >
            {isDeafened ? (
              <HeadphoneOff size={18} className="text-red-500" />
            ) : (
              <Headphones size={18} />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            type="button"
            title={isMicMuted ? "Включить микрофон" : "Выключить микрофон"}
            aria-label={isMicMuted ? "Включить микрофон" : "Выключить микрофон"}
            onClick={() => void toggleMic()}
            className="cursor-pointer h-8 w-8"
          >
            {isMicMuted ? (
              <MicOff size={18} className="text-red-500" />
            ) : (
              <Mic size={18} />
            )}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            type="button"
            title="Отключиться"
            aria-label="Отключиться"
            onClick={() => void leave()}
            className="cursor-pointer h-8 w-8 "
          >
            <PhoneOff size={18} className="text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
};
