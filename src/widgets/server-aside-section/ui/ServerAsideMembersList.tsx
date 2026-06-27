import {
  ServerAsideList,
  ServerAsideListItem,
  ServerAsideListItemUser,
  ServerAsideListTitle,
  ServerAsideUnorderList,
} from "@/features";
import { Button } from "@/shared";
import { UserRoundPlus } from "lucide-react";

export const ServerAsideMembersList = () => {
  return (
    <ServerAsideList
      renderTitle={() => (
        <ServerAsideListTitle className="uppercase">
          Участники (3)
        </ServerAsideListTitle>
      )}
      renderTitleButton={() => (
        <Button variant="ghost" size="sm" className="cursor-pointer h-7 w-7">
          <UserRoundPlus size={20} absoluteStrokeWidth />
        </Button>
      )}
      renderList={() => (
        <ServerAsideUnorderList>
          <ServerAsideListItem className="hover:bg-transparent">
            <ServerAsideListItemUser username="Алексей" />
            <ServerAsideListItemUser username="Николай 👑" />
            <ServerAsideListItemUser username="Иван" />
            <ServerAsideListItemUser username="Алексей" />
            <ServerAsideListItemUser username="Николай" />
            <ServerAsideListItemUser username="Иван" />
            <ServerAsideListItemUser username="Алексей" />
            <ServerAsideListItemUser username="Николай" />
            <ServerAsideListItemUser username="Иван" />
            <ServerAsideListItemUser username="Алексей" />
            <ServerAsideListItemUser username="Николай" />
            <ServerAsideListItemUser username="Иван" />
            <ServerAsideListItemUser username="Алексей" />
            <ServerAsideListItemUser username="Николай" />
            <ServerAsideListItemUser username="Иван" />
            <ServerAsideListItemUser username="Алексей" />
            <ServerAsideListItemUser username="Николай" />
            <ServerAsideListItemUser username="Иван" />
            <ServerAsideListItemUser username="Алексей" />
            <ServerAsideListItemUser username="Николай" />
            <ServerAsideListItemUser username="Иван" />
          </ServerAsideListItem>
        </ServerAsideUnorderList>
      )}
    />
  );
};
