import type { ReactNode } from "react";
import { Headphones, HeadphoneOff, Mic, MicOff, PhoneOff } from "lucide-react";

import { Button, cn } from "@/shared";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/ui/tooltip";
import { useVoiceConnection } from "../hooks/useVoiceConnection";

type StageControlButtonProps = {
  label: string;
  isActive?: boolean;
  isDanger?: boolean;
  onClick: () => void;
  children: ReactNode;
};

const StageControlButton = ({
  label,
  isActive = false,
  isDanger = false,
  onClick,
  children,
}: StageControlButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        type="button"
        variant={isDanger ? "destructive" : "secondary"}
        size="icon-lg"
        aria-label={label}
        aria-pressed={isDanger ? undefined : isActive}
        onClick={onClick}
        className={cn(
          "size-12 rounded-full [&_svg:not([class*='size-'])]:size-5",
          isActive && "bg-red-500/15 text-red-500 hover:bg-red-500/25",
          isDanger && "bg-red-500 text-white hover:bg-red-600",
        )}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="top" sideOffset={8}>
      {label}
    </TooltipContent>
  </Tooltip>
);

/** Кнопки управления звонком внизу комнаты. */
export const VoiceStageControls = () => {
  const { isMicMuted, isDeafened, leave, toggleMic, toggleDeafen } =
    useVoiceConnection();

  return (
    <div className="flex shrink-0 items-center justify-center gap-3 pt-1">
      <StageControlButton
        label={isMicMuted ? "Включить микрофон" : "Выключить микрофон"}
        isActive={isMicMuted}
        onClick={toggleMic}
      >
        {isMicMuted ? <MicOff /> : <Mic />}
      </StageControlButton>

      <StageControlButton
        label={isDeafened ? "Включить звук" : "Выключить звук"}
        isActive={isDeafened}
        onClick={toggleDeafen}
      >
        {isDeafened ? <HeadphoneOff /> : <Headphones />}
      </StageControlButton>

      <StageControlButton label="Отключиться" isDanger onClick={leave}>
        <PhoneOff />
      </StageControlButton>
    </div>
  );
};
