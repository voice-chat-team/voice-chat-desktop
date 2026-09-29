import { useLoaderData } from "react-router";
import { SplitPane, Pane } from "react-split-pane";

import { useServerStore, useGuildChannelEvents } from "@/entities/server";
import { useEffect } from "react";
import { GuildDto, useIsMobile } from "@/shared";
import { ServerAsideSection } from "@/widgets";

import { ServerActiveView } from "./ServerActiveView";
import { MobileServerView } from "./MobileServerView";

function ServerPage() {
  const guild = useLoaderData() as GuildDto;
  const setGuild = useServerStore((s) => s.actions.setGuild);
  const resetActiveView = useServerStore((s) => s.actions.resetActiveView);
  const storeGuildId = useServerStore((s) => s.state.guild?.id);
  const isMobile = useIsMobile();

  useGuildChannelEvents(guild.id);

  useEffect(() => {
    setGuild(guild);

    return () => {
      setGuild(null);
      resetActiveView();
    };
  }, [guild, setGuild, resetActiveView]);

  if (storeGuildId !== guild.id) return null;

  if (isMobile) return <MobileServerView />;

  return (
    <SplitPane
      direction="horizontal"
      dividerStyle={{ backgroundColor: "var(--border-subtle)" }}
    >
      <Pane minSize={200} defaultSize={250} maxSize={500}>
        <ServerAsideSection />
      </Pane>
      <Pane className="bg-surface-200">
        <ServerActiveView />
      </Pane>
    </SplitPane>
  );
}

export default ServerPage;
