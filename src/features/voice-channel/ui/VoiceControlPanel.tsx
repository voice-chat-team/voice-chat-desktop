import {
  Headphones,
  HeadphoneOff,
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
} from "lucide-react";

import { useVoiceStore } from "@/entities/voice";
import { Button, cn } from "@/shared";
import { useVoiceConnection } from "../hooks/useVoiceConnection";

export const VoiceControlPanel = () => {
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
    <div className="pt-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-xs text-secondary/70 truncate">
        <Volume2
          size={14}
          className={cn(status === "connected" && "text-green-500")}
        />
        <span className="truncate">{statusTitle}</span>
      </div>

      <div className="flex gap-1">
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
            <MicOff size={16} className="text-red-500" />
          ) : (
            <Mic size={16} />
          )}
        </Button>

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
            <HeadphoneOff size={16} className="text-red-500" />
          ) : (
            <Headphones size={16} />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          type="button"
          title="Отключиться"
          aria-label="Отключиться"
          onClick={() => void leave()}
          className="cursor-pointer h-8 w-8 ml-auto"
        >
          <PhoneOff size={16} className="text-red-500" />
        </Button>
      </div>
    </div>
  );
};
