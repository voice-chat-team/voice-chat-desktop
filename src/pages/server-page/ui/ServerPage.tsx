import { useLoaderData } from "react-router";
import { SplitPane, Pane } from "react-split-pane";

import { GuildBoard, GuildChat } from "@/features";
import { useServerStore, useGuildChannelEvents } from "@/entities/server";
import { Suspense, useEffect } from "react";
import { GuildDto } from "@/shared";
import { ServerAsideSection } from "@/widgets";

function ServerPage() {
  const guild = useLoaderData() as GuildDto;
  const setGuild = useServerStore((s) => s.actions.setGuild);
  const resetActiveView = useServerStore((s) => s.actions.resetActiveView);
  const activeTextChannel = useServerStore((s) => s.state.activeTextChannel);
  const activeBoard = useServerStore((s) => s.state.activeBoard);

  useGuildChannelEvents(guild.id);

  useEffect(() => {
    setGuild(guild);

    return () => {
      setGuild(null);
      resetActiveView();
    };
  }, [guild, setGuild, resetActiveView]);

  return (
    <SplitPane
      direction="horizontal"
      dividerStyle={{ backgroundColor: "oklch(1 0 0 / 5%)" }}
    >
      <Pane minSize={200} defaultSize={250} maxSize={500}>
        <ServerAsideSection />
      </Pane>
      <Pane>
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
      </Pane>
    </SplitPane>
  );
}

export default ServerPage;
