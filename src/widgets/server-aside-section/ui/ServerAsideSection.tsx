import {
  ServerAsideList,
  ServerAsideListItem,
  ServerAsideListItemHeader,
  ServerAsideListItemUser,
  ServerAsideListTitle,
  ServerAsideUnorderList,
} from "@/features";
import { Avatar, AvatarFallback, Button, Separator } from "@/shared";
import {
  Hash,
  Plus,
  Volume2,
  Lock,
  UserRoundPlus,
  Settings2,
} from "lucide-react";

const DEFAILT_ICONS_TOP_TITLE_SIZE = 12;
const DEFAILT_ICONS_TITLE_SIZE = 15;

export const ServerAsideSection = () => {
  return (
    <aside className="bg-zinc-900 h-full px-2 pb-4 flex flex-col justify-between overflow-y-hidden">
      <div className="flex flex-col gap-3 overflow-auto scrollbar-none pt-4">
        <div className="leading-2.5 flex gap-1 flex-col">
          <h1 className="text-white text-xl font-medium truncate">Сервер #1</h1>
          <small className="text-secondary/65 text-xs">
            Комната для общих обсуждений
          </small>
        </div>

        <Separator />

        <ServerAsideList
          renderTitle={() => (
            <ServerAsideListTitle className="uppercase">
              <Volume2 size={DEFAILT_ICONS_TOP_TITLE_SIZE} />
              Голосовые каналы
            </ServerAsideListTitle>
          )}
          renderTitleButton={() => (
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer h-7 w-7"
            >
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

        <Separator />

        <ServerAsideList
          renderTitle={() => (
            <ServerAsideListTitle className="uppercase">
              <Hash size={DEFAILT_ICONS_TOP_TITLE_SIZE} />
              Текстовые каналы
            </ServerAsideListTitle>
          )}
          renderTitleButton={() => (
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer h-7 w-7"
            >
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

        <Separator />

        <ServerAsideList
          renderTitle={() => (
            <ServerAsideListTitle className="uppercase">
              Участники (3)
            </ServerAsideListTitle>
          )}
          renderTitleButton={() => (
            <Button
              variant="ghost"
              size="sm"
              className="cursor-pointer h-7 w-7"
            >
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
      </div>

      <div>
        <Separator />

        <div className="pt-4 flex justify-between">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarFallback className="font-medium">T</AvatarFallback>
            </Avatar>
            <p className="truncate">TankistPro</p>
          </div>

          <Button className="bg-accent/20">
            <Settings2 />
          </Button>
        </div>
      </div>
    </aside>
  );
};
