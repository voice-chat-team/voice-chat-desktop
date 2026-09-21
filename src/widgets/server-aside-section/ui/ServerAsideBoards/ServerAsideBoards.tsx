import {
  CreateBoardModal,
  ServerAsideList,
  ServerAsideListItem,
  ServerAsideListItemHeader,
  ServerAsideListTitle,
  ServerAsideUnorderList,
} from "@/features";
import { Frame, PencilRuler, Plus } from "lucide-react";
import {
  DEFAILT_ICONS_TITLE_SIZE,
  DEFAILT_ICONS_TOP_TITLE_SIZE,
} from "../../models";
import { Button, cn, type BoardDto } from "@/shared";
import { useState } from "react";
import { useServerStore } from "@/entities/server";

export const ServerAsideBoards = ({ boards }: { boards: BoardDto[] }) => {
  const guildId = useServerStore((store) => store.state.guild?.id);
  const activeBoard = useServerStore((store) => store.state.activeBoard);
  const setActiveBoard = useServerStore((store) => store.actions.setActiveBoard);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <ServerAsideList
        renderTitle={() => (
          <ServerAsideListTitle className="uppercase">
            <PencilRuler size={DEFAILT_ICONS_TOP_TITLE_SIZE} />
            Доски
          </ServerAsideListTitle>
        )}
        renderTitleButton={() => (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setIsCreateModalOpen(!isCreateModalOpen)}
            className="cursor-pointer h-7 w-7"
          >
            <Plus size={20} absoluteStrokeWidth />
          </Button>
        )}
        renderList={() => (
          <ServerAsideUnorderList>
            {boards.map((board) => (
              <ServerAsideListItem
                key={board.id}
                onClick={() => setActiveBoard(board)}
                className={cn(activeBoard?.id === board.id && "bg-accent/20")}
              >
                <ServerAsideListItemHeader>
                  <ServerAsideListTitle>
                    <Frame size={DEFAILT_ICONS_TITLE_SIZE} /> {board.name}
                  </ServerAsideListTitle>
                </ServerAsideListItemHeader>
              </ServerAsideListItem>
            ))}
          </ServerAsideUnorderList>
        )}
      />

      <CreateBoardModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        guildId={guildId ?? ""}
      />
    </>
  );
};
