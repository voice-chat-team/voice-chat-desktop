import { useLoaderData } from "react-router";
import { SplitPane, Pane } from "react-split-pane";

import { GuildChat } from "@/features";
import { useServerStore, useGuildChannelEvents } from "@/entities/server";
import { Suspense, useEffect } from "react";
import { GuildDto } from "@/shared";
import { ServerAsideSection } from "@/widgets";

function ServerPage() {
  const guild = useLoaderData() as GuildDto;
  const setGuild = useServerStore((s) => s.actions.setGuild);
  const setActiveTextChannel = useServerStore(
    (s) => s.actions.setActiveTextChannel,
  );
  const activeTextChannel = useServerStore((s) => s.state.activeTextChannel);

  useGuildChannelEvents(guild.id);

  useEffect(() => {
    setGuild(guild);

    return () => {
      setGuild(null);
      setActiveTextChannel(null);
    };
  }, [guild, setGuild, setActiveTextChannel]);

  return (
    <SplitPane
      direction="horizontal"
      dividerStyle={{ backgroundColor: "oklch(1 0 0 / 5%)" }}
    >
      <Pane minSize={200} defaultSize={250} maxSize={500}>
        <ServerAsideSection />
      </Pane>
      <Pane>
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
