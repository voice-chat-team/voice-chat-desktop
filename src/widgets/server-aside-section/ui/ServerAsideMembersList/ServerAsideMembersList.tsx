import {
  ServerAsideList,
  ServerAsideListItem,
  ServerAsideListItemUser,
  ServerAsideListTitle,
  ServerAsideUnorderList,
  ManageMembersDialog,
} from "@/features";
import { Button, GuildMemberDto } from "@/shared";
import { UserRoundPlus } from "lucide-react";
import { useState } from "react";

export const ServerAsideMembersList = ({
  members,
}: {
  members?: GuildMemberDto[];
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <ServerAsideList
        renderTitle={() => (
          <ServerAsideListTitle className="uppercase">
            Участники - {members?.length}
          </ServerAsideListTitle>
        )}
        renderTitleButton={() => (
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer h-7 w-7"
            onClick={() => setIsModalOpen(!isModalOpen)}
          >
            <UserRoundPlus size={20} absoluteStrokeWidth />
          </Button>
        )}
        renderList={() => (
          <ServerAsideUnorderList>
            <ServerAsideListItem className="hover:bg-transparent">
              {members &&
                members?.length > 0 &&
                members.map((m) => (
                  <ServerAsideListItemUser
                    key={m.id}
                    user={m.user}
                    isOwner={m.isGuildOwner}
                  />
                ))}
            </ServerAsideListItem>
          </ServerAsideUnorderList>
        )}
      />

      <ManageMembersDialog open={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
};
