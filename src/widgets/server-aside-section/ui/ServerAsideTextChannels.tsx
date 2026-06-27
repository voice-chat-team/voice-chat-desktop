import {
  ServerAsideList,
  ServerAsideListItem,
  ServerAsideListItemHeader,
  ServerAsideListTitle,
  ServerAsideUnorderList,
} from "@/features";
import { Hash, Plus } from "lucide-react";
import {
  DEFAILT_ICONS_TITLE_SIZE,
  DEFAILT_ICONS_TOP_TITLE_SIZE,
} from "../models";
import { Button } from "@/shared";

export const ServerAsideTextChannels = () => {
  return (
    <ServerAsideList
      renderTitle={() => (
        <ServerAsideListTitle className="uppercase">
          <Hash size={DEFAILT_ICONS_TOP_TITLE_SIZE} />
          Текстовые каналы
        </ServerAsideListTitle>
      )}
      renderTitleButton={() => (
        <Button variant="ghost" size="sm" className="cursor-pointer h-7 w-7">
          <Plus size={20} absoluteStrokeWidth />
        </Button>
      )}
      renderList={() => (
        <ServerAsideUnorderList>
          <ServerAsideListItem>
            <ServerAsideListItemHeader>
              <ServerAsideListTitle>
                <Hash size={DEFAILT_ICONS_TITLE_SIZE} /> Общий
              </ServerAsideListTitle>
            </ServerAsideListItemHeader>
          </ServerAsideListItem>
          <ServerAsideListItem>
            <ServerAsideListItemHeader>
              <ServerAsideListTitle>
                <Hash size={DEFAILT_ICONS_TITLE_SIZE} /> Тренировки
              </ServerAsideListTitle>
            </ServerAsideListItemHeader>
          </ServerAsideListItem>
        </ServerAsideUnorderList>
      )}
    />
  );
};
