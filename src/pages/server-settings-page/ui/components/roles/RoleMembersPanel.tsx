import type { GuildRole } from "@/entities/role";
import {
  Avatar,
  AvatarFallback,
  Button,
  cn,
  createAbbr,
  getAvatarColorClass,
} from "@/shared";
import { UserRoundPlus, X } from "lucide-react";

type RoleMembersPanelProps = {
  role: GuildRole;
  onRemove: (memberId: string) => void;
};

export const RoleMembersPanel = ({ role, onRemove }: RoleMembersPanelProps) => {
  if (role.members.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-border-subtle px-6 py-10 text-center">
        <p className="text-[15px] font-medium text-text-primary">
          В этой роли пока никого нет
        </p>
        <p className="max-w-sm text-sm text-text-muted">
          Добавьте участников, чтобы выдать им цвет и права роли.
        </p>
        <Button type="button" variant="brand">
          <UserRoundPlus />
          Добавить участников
        </Button>
      </div>
    );
  }

  return (
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
          <Button type="button" size="sm" variant="subtle">
            <UserRoundPlus />
            Добавить участников
          </Button>
        </div>
      )}

      <ul className="flex flex-col gap-px">
        {role.members.map((member) => (
          <li
            key={member.id}
            className="group/member flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-surface-raised"
          >
            <Avatar>
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
              style={{ color: role.color }}
            >
              {member.username}
            </span>
            {!role.isDefault && (
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
  );
};
