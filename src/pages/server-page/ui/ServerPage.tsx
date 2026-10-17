import { useLoaderData, useNavigate, useRevalidator } from "react-router";
import { SplitPane, Pane } from "react-split-pane";
import { toast } from "sonner";

import { useServerStore, useGuildChannelEvents } from "@/entities/server";
import { useGuildVoiceEvents } from "@/entities/voice";
import { useGuildBoardEvents } from "@/entities/board";
import { useGuildRoleEvents } from "@/entities/role";
import { useEffect } from "react";
import { GuildDto, ROUTES, useIsMobile } from "@/shared";
import { ServerAsideSection } from "@/widgets";

import { ServerActiveView } from "./ServerActiveView";
import { MobileServerView } from "./MobileServerView";

function ServerPage() {
  const guild = useLoaderData() as GuildDto;
  const setGuild = useServerStore((s) => s.actions.setGuild);
  const resetActiveView = useServerStore((s) => s.actions.resetActiveView);
  const setActiveBoard = useServerStore((s) => s.actions.setActiveBoard);
  const storeGuildId = useServerStore((s) => s.state.guild?.id);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  useGuildChannelEvents(guild.id);
  useGuildRoleEvents(guild.id, {
    // Шапка читает сервер из стора, лоадер — из уже обновлённого кэша.
    onGuildUpdated: (updated) => {
      setGuild(updated);
      void revalidator.revalidate();
    },
    onKicked: () => {
      toast.info(`Вас исключили с сервера «${guild.name}»`);
      void navigate(ROUTES.WELCOME, { replace: true });
    },
  });
  useGuildVoiceEvents(guild.id);
  useGuildBoardEvents(guild.id, {
    // Открытая доска держит свою копию BoardDto в сторе — без этого
    // заголовок остался бы со старым названием.
    onBoardUpdated: (board) => {
      if (useServerStore.getState().state.activeBoard?.id === board.id) {
        setActiveBoard(board);
      }
    },
    onBoardDeleted: (boardId) => {
      if (useServerStore.getState().state.activeBoard?.id === boardId) {
        setActiveBoard(null);
      }
    },
  });

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
