import {
  ServerAsideList,
  ServerAsideListItem,
  ServerAsideListItemUser,
  ServerAsideListTitle,
  ServerAsideListTitleButton,
  ServerAsideUnorderList,
  ManageMembersDialog,
} from "@/features";
import { GuildMemberDto, useCurrentUser } from "@/shared";
import { UserRoundPlus } from "lucide-react";
import { useState } from "react";

export const ServerAsideMembersList = ({
  members,
}: {
  members?: GuildMemberDto[];
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: currentUser } = useCurrentUser();

  return (
    <>
      <ServerAsideList
        renderTitle={() => (
          <ServerAsideListTitle>
            Участники — {members?.length ?? 0}
          </ServerAsideListTitle>
        )}
        renderTitleButton={() => (
          <ServerAsideListTitleButton
            onClick={() => setIsModalOpen(!isModalOpen)}
            aria-label="Пригласить участников"
          >
            <UserRoundPlus />
          </ServerAsideListTitleButton>
        )}
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
                />
              </ServerAsideListItem>
            ))}
          </ServerAsideUnorderList>
        )}
      />

      <ManageMembersDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};
