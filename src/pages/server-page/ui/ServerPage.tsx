import { useLoaderData } from "react-router";
import { SplitPane, Pane } from "react-split-pane";

import { ServerAsideSection, ServerChat } from "@/widgets";
import { useServerStore } from "@/entities/server";
import { useEffect } from "react";
import { GuildDto } from "@/shared";

function ServerPage() {
  const guild = useLoaderData() as GuildDto;
  const setGuild = useServerStore((s) => s.actions.setGuild);

  useEffect(() => {
    setGuild(guild);
    return () => setGuild(null);
  }, [guild, setGuild]);

  return (
    <SplitPane
      direction="horizontal"
      dividerStyle={{ backgroundColor: "oklch(1 0 0 / 5%)" }}
    >
      <Pane minSize={200} defaultSize={250} maxSize={500}>
        <ServerAsideSection />
      </Pane>
      <Pane>
        <ServerChat />
      </Pane>
    </SplitPane>
  );
}

export default ServerPage;
