import { Suspense } from "react";

import { GuildBoard, GuildChat, VoiceChannelStage } from "@/features";
import { useServerStore } from "@/entities/server";

export const ServerActiveView = () => {
  const activeTextChannel = useServerStore((s) => s.state.activeTextChannel);
  const activeBoard = useServerStore((s) => s.state.activeBoard);
  const activeVoiceChannel = useServerStore((s) => s.state.activeVoiceChannel);

  return (
    <>
      {activeBoard && (
        <Suspense fallback={null}>
          <GuildBoard key={activeBoard.id} board={activeBoard} />
        </Suspense>
      )}

      {activeTextChannel && (
        <Suspense fallback={null}>
          <GuildChat key={activeTextChannel.id} channel={activeTextChannel} />
        </Suspense>
      )}

      {activeVoiceChannel && (
        <Suspense fallback={null}>
          <VoiceChannelStage
            key={activeVoiceChannel.id}
            channel={activeVoiceChannel}
          />
        </Suspense>
      )}
    </>
  );
};
