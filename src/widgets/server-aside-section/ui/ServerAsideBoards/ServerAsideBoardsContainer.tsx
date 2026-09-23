import { useGuildBoards } from "@/entities/board";
import { useServerStore } from "@/entities/server";

import { ServerAsideBoards } from "./ServerAsideBoards";

export const ServerAsideBoardsContainer = () => {
  // Гильдия попадает в стор из эффекта ServerPage, то есть не на самом первом
  // рендере, поэтому читаем её мягко и до готовности ничего не показываем.
  const guild = useServerStore((s) => s.state.guild);

  const { boards } = useGuildBoards(guild?.id ?? "");

  if (!guild) return null;

  return <ServerAsideBoards boards={boards} />;
};
