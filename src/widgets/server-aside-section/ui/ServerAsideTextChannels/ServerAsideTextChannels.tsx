import {
  CreateChannelModal,
  ServerAsideList,
  ServerAsideListItem,
  ServerAsideListItemHeader,
  ServerAsideListTitle,
  ServerAsideUnorderList,
} from "@/features";
import { Hash, Lock, Plus } from "lucide-react";
import {
  DEFAILT_ICONS_TITLE_SIZE,
  DEFAILT_ICONS_TOP_TITLE_SIZE,
} from "../../models";
import { Button, ChannelDto } from "@/shared";
import { useState } from "react";
import { useServerStore } from "@/entities/server";

export const ServerAsideTextChannels = ({
  channels,
}: {
  channels: ChannelDto[];
}) => {
  const guildId = useServerStore((store) => store.state.guild?.id);
  const setActiveTextChannel = useServerStore((store) => store.actions.setActiveTextChannel);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
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
            type="button"
            onClick={() => setIsCreateModalOpen(!isCreateModalOpen)}
            className="cursor-pointer h-7 w-7"
          >
            <Plus size={20} absoluteStrokeWidth />
          </Button>
        )}
        renderList={() => (
          <ServerAsideUnorderList>
            {channels.map((ch) => (
              <ServerAsideListItem key={ch.id} onClick={() => setActiveTextChannel(ch)}>
                <ServerAsideListItemHeader>
                  <ServerAsideListTitle>
                    <Hash size={DEFAILT_ICONS_TITLE_SIZE} /> {ch.name}
                  </ServerAsideListTitle>
                  {ch.isPrivate && <Lock size={DEFAILT_ICONS_TITLE_SIZE} />}
                </ServerAsideListItemHeader>
              </ServerAsideListItem>
            ))}
          </ServerAsideUnorderList>
        )}
      />

      <CreateChannelModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        guildId={guildId ?? ""}
      />
    </>
  );
};
