import { useParams } from "react-router";
import { SplitPane, Pane } from "react-split-pane";

import { ServerAsideSection, ServerChat } from "@/widgets";
import { useCurrentServerInfo } from "@/entities/server";

function ServerPage() {
  const { serverId } = useParams<{ serverId: string }>();
  const { isLoading, guild } = useCurrentServerInfo(serverId!);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-muted-foreground">Загрузка сервера...</div>
      </div>
    );
  }

  if (!guild) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-destructive">Сервер не найден</div>
      </div>
    );
  }

  return (
    <SplitPane
      direction="horizontal"
      dividerStyle={{ backgroundColor: "oklch(1 0 0 / 20%)" }}
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
