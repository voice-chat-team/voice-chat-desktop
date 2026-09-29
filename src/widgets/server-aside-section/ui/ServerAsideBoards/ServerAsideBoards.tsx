import {
  CreateBoardModal,
  ServerAsideList,
  ServerAsideListItem,
  ServerAsideListItemHeader,
  ServerAsideListTitle,
  ServerAsideListTitleButton,
  ServerAsideUnorderList,
} from "@/features";
import { Frame, Plus } from "lucide-react";
import { DEFAILT_ICONS_TITLE_SIZE } from "../../models";
import { type BoardDto } from "@/shared";
import { useState } from "react";
import { useServerStore } from "@/entities/server";

export const ServerAsideBoards = ({ boards }: { boards: BoardDto[] }) => {
  const guildId = useServerStore((store) => store.state.guild?.id);
  const activeBoardId = useServerStore((store) => store.state.activeBoard?.id);
  const setActiveBoard = useServerStore(
    (store) => store.actions.setActiveBoard,
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <ServerAsideList
        renderTitle={() => <ServerAsideListTitle>Доски</ServerAsideListTitle>}
        renderTitleButton={() => (
          <ServerAsideListTitleButton
            onClick={() => setIsCreateModalOpen(!isCreateModalOpen)}
            aria-label="Создать доску"
          >
            <Plus />
          </ServerAsideListTitleButton>
        )}
        renderList={() => (
          <ServerAsideUnorderList>
            {boards.map((board) => (
              <ServerAsideListItem
                key={board.id}
                onClick={() => setActiveBoard(board)}
                isActive={activeBoardId === board.id}
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
