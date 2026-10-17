import type { GuildRole } from "@/entities/role";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  cn,
  createAbbr,
  getAvatarColorClass,
  type GuildMemberDto,
} from "@/shared";
import { UserRoundPlus, X } from "lucide-react";
import { useState } from "react";
import { AddRoleMembersDialog } from "./AddRoleMembersDialog";

type RoleMembersPanelProps = {
  role: GuildRole;
  guildMembers: GuildMemberDto[];
  readOnly?: boolean;
  onAdd: (userIds: string[]) => void;
  onRemove: (memberId: string) => void;
};

export const RoleMembersPanel = ({
  role,
  guildMembers,
  readOnly = false,
  onAdd,
  onRemove,
}: RoleMembersPanelProps) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const canEdit = !role.isDefault && !readOnly;

  const addButton = (size: "sm" | "default", variant: "subtle" | "brand") => (
    <Button
      type="button"
      size={size}
      variant={variant}
      onClick={() => setIsAddOpen(true)}
    >
      <UserRoundPlus />
      Добавить участников
    </Button>
  );

  return (
    <>
      {role.members.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-border-subtle px-6 py-10 text-center">
          <p className="text-[15px] font-medium text-text-primary">
            В этой роли пока никого нет
          </p>
          {canEdit && (
            <>
              <p className="max-w-sm text-sm text-text-muted">
                Добавьте участников, чтобы выдать им цвет и права роли.
              </p>
              {addButton("default", "brand")}
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {role.isDefault ? (
            <p className="text-sm text-text-muted">
              Роль @everyone есть у всех участников сервера, её нельзя снять.
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-text-muted">
                Участники с ролью получают её цвет и права.
              </p>
              {canEdit && addButton("sm", "subtle")}
            </div>
          )}

          <ul className="flex flex-col gap-px">
            {role.members.map((member) => (
              <li
                key={member.id}
                className="group/member flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-surface-raised"
              >
                <Avatar>
                  {member.avatarUrl && (
                    <AvatarImage src={member.avatarUrl} alt={member.username} />
                  )}
                  <AvatarFallback
                    className={cn(
                      "font-semibold text-text-on-brand",
                      getAvatarColorClass(member.id),
                    )}
                  >
                    {createAbbr(member.username, 1)}
                  </AvatarFallback>
                </Avatar>
                <span
                  className="min-w-0 flex-1 truncate text-[15px] font-medium"
                  style={{ color: role.isDefault ? undefined : role.color }}
                >
                  {member.username}
                </span>
                {canEdit && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Убрать ${member.username} из роли`}
                    title="Убрать из роли"
                    className="text-text-faint opacity-0 group-hover/member:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
                    onClick={() => onRemove(member.id)}
                  >
                    <X />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {canEdit && (
        <AddRoleMembersDialog
          role={role}
          guildMembers={guildMembers}
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          onAdd={onAdd}
        />
      )}
    </>
  );
};
