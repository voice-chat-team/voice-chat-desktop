import {
  ServerAsideList,
  ServerAsideListItem,
  ServerAsideListItemHeader,
  ServerAsideListItemUser,
  ServerAsideListTitle,
  ServerAsideUnorderList,
} from "@/features";
import { Button } from "@/shared";
import { Plus, Volume2, Lock } from "lucide-react";
import {
  DEFAILT_ICONS_TITLE_SIZE,
  DEFAILT_ICONS_TOP_TITLE_SIZE,
} from "../models";

export const ServerAsideVoiceChannels = () => {
  return (
    <ServerAsideList
      renderTitle={() => (
        <ServerAsideListTitle className="uppercase">
          <Volume2 size={DEFAILT_ICONS_TOP_TITLE_SIZE} />
          Голосовые каналы
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
                <Volume2 size={DEFAILT_ICONS_TITLE_SIZE} /> Основной канал
              </ServerAsideListTitle>
            </ServerAsideListItemHeader>
            <div className="flex flex-col gap-2">
              <ServerAsideListItemUser username="Алексей" />
              <ServerAsideListItemUser username="Иван" />
            </div>
          </ServerAsideListItem>
          <ServerAsideListItem>
            <ServerAsideListItemHeader>
              <ServerAsideListTitle className="justify-between">
                <div className="flex gap-2 items-center">
                  <Volume2 size={DEFAILT_ICONS_TITLE_SIZE} /> Мир танков
                </div>
                <Lock size={DEFAILT_ICONS_TITLE_SIZE} />
              </ServerAsideListTitle>
            </ServerAsideListItemHeader>
          </ServerAsideListItem>
          <ServerAsideListItem>
            <ServerAsideListItemHeader>
              <ServerAsideListTitle className="justify-between">
                <div className="flex gap-2 items-center">
                  <Volume2 size={DEFAILT_ICONS_TITLE_SIZE} /> AFK
                </div>
              </ServerAsideListTitle>
            </ServerAsideListItemHeader>
          </ServerAsideListItem>
        </ServerAsideUnorderList>
      )}
    />
  );
};
