import { MicOff } from "lucide-react";

import { Avatar, AvatarFallback, cn, createAbbr } from "@/shared";

type VoiceParticipantTileProps = {
  username: string;
  isSpeaking: boolean;
  isMuted: boolean;
  isCurrentUser: boolean;
};

export const VoiceParticipantTile = ({
  username,
  isSpeaking,
  isMuted,
  isCurrentUser,
}: VoiceParticipantTileProps) => {
  return (
    <div
      className={cn(
        "relative aspect-video min-h-35 rounded-xl bg-zinc-800/60",
        "flex flex-col items-center justify-center gap-3",
        "border-2 border-transparent transition-colors duration-150",
        isSpeaking && "border-violet-500 bg-violet-500/10",
      )}
    >
      <Avatar
        size="extra"
        className={cn(
          "transition-shadow duration-150",
          isSpeaking && "shadow-[0_0_0_4px_oklch(0.606_0.25_292.717/0.35)]",
        )}
      >
        <AvatarFallback className="font-medium">
          {createAbbr(username, 1)}
        </AvatarFallback>
      </Avatar>

      <div className="flex items-center gap-1.5 max-w-full px-3">
        {isMuted && (
          <MicOff
            size={16}
            className="text-red-500 shrink-0"
            aria-label="Микрофон выключен"
          />
        )}
        <span className="text text-secondary truncate">
          {username}
          {isCurrentUser && " (вы)"}
        </span>
      </div>
    </div>
  );
};
