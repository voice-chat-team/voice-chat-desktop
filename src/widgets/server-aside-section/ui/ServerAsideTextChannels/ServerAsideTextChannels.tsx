import {
  CreateChannelModal,
  ServerAsideList,
  ServerAsideListItem,
  ServerAsideListItemHeader,
  ServerAsideListTitle,
  ServerAsideListTitleButton,
  ServerAsideUnorderList,
} from "@/features";
import { Hash, Lock, Plus } from "lucide-react";
import { DEFAILT_ICONS_TITLE_SIZE } from "../../models";
import { ChannelDto } from "@/shared";
import { useState } from "react";
import { useServerStore } from "@/entities/server";

export const ServerAsideTextChannels = ({
  channels,
}: {
  channels: ChannelDto[];
}) => {
  const guildId = useServerStore((store) => store.state.guild?.id);
  const setActiveTextChannel = useServerStore(
    (store) => store.actions.setActiveTextChannel,
  );
  const activeTextChannelId = useServerStore(
    (store) => store.state.activeTextChannel?.id,
  );

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <>
      <ServerAsideList
        renderTitle={() => (
          <ServerAsideListTitle>Текстовые каналы</ServerAsideListTitle>
        )}
        renderTitleButton={() => (
          <ServerAsideListTitleButton
            onClick={() => setIsCreateModalOpen(!isCreateModalOpen)}
            aria-label="Создать текстовый канал"
          >
            <Plus />
          </ServerAsideListTitleButton>
        )}
        renderList={() => (
          <ServerAsideUnorderList>
            {channels.map((ch) => (
              <ServerAsideListItem
                key={ch.id}
                onClick={() => setActiveTextChannel(ch)}
                isActive={activeTextChannelId === ch.id}
              >
                <ServerAsideListItemHeader>
                  <ServerAsideListTitle>
                    <Hash size={DEFAILT_ICONS_TITLE_SIZE} /> {ch.name}
                  </ServerAsideListTitle>
                  {ch.isPrivate && <Lock size={14} />}
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
