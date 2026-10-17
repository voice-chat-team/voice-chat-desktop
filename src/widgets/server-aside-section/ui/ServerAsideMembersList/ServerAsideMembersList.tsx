import {
  ServerAsideList,
  ServerAsideListItem,
  ServerAsideListItemUser,
  ServerAsideListTitle,
  ServerAsideListTitleButton,
  ServerAsideUnorderList,
  ManageMembersDialog,
} from "@/features";
import { useGuildPermissions, useMemberRoleColor } from "@/entities/role";
import { GuildMemberDto, useCurrentUser } from "@/shared";
import { UserRoundPlus } from "lucide-react";
import { useState } from "react";

export const ServerAsideMembersList = ({
  guildId,
  members,
}: {
  guildId: string;
  members?: GuildMemberDto[];
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();
  const permissions = useGuildPermissions(guildId);
  const getNameColor = useMemberRoleColor(guildId);

  // В окне — приглашения и исключение участников; без обоих прав открывать нечего.
  const canManageMembers =
    permissions.has("INVITE_MEMBERS") || permissions.has("KICK_MEMBERS");

  return (
    <>
      <ServerAsideList
        renderTitle={() => (
          <ServerAsideListTitle>
            Участники — {members?.length ?? 0}
          </ServerAsideListTitle>
        )}
        renderTitleButton={
          canManageMembers
            ? () => (
                <ServerAsideListTitleButton
                  onClick={() => setIsModalOpen(!isModalOpen)}
                  aria-label="Управление участниками"
                >
                  <UserRoundPlus />
                </ServerAsideListTitleButton>
              )
            : undefined
        }
        renderList={() => (
          <ServerAsideUnorderList>
            {members?.map((m) => (
              <ServerAsideListItem
                key={m.id}
                className="py-1.5 hover:bg-surface-raised"
              >
                <ServerAsideListItemUser
                  user={m.user}
                  isOwner={m.isGuildOwner}
                  isSelf={m.userId === currentUser?.id}
                  nameColor={getNameColor(m.userId)}
                />
              </ServerAsideListItem>
            ))}
          </ServerAsideUnorderList>
        )}
      />

      {canManageMembers && (
        <ManageMembersDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
      )}
    </>
  );
};
