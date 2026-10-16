import type { GuildRole } from "@/entities/role";
import { Button, cn } from "@/shared";
import { Plus, UsersRound } from "lucide-react";

type RolesListProps = {
  roles: GuildRole[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
};

const RoleRow = ({
  role,
  isSelected,
  onSelect,
}: {
  role: GuildRole;
  isSelected: boolean;
  onSelect: () => void;
}) => (
  <li>
    <button
      type="button"
      onClick={onSelect}
      aria-current={isSelected ? "true" : undefined}
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-[7px] text-left text-[15px] leading-5 font-medium text-text-secondary transition-colors outline-none hover:bg-surface-raised hover:text-text-primary focus-visible:bg-surface-raised",
        isSelected &&
          "bg-surface-raised font-semibold text-text-primary before:absolute before:top-1.5 before:bottom-1.5 before:-left-2 before:w-[3px] before:rounded-full before:bg-brand",
      )}
    >
      <span
        className="size-3 shrink-0 rounded-full"
        style={{ backgroundColor: role.color }}
      />
      <span className="min-w-0 flex-1 truncate">{role.name}</span>
      <span
        className="flex shrink-0 items-center gap-1 text-xs text-text-faint tabular-nums"
        aria-label={`Участников: ${role.members.length}`}
      >
        <UsersRound className="size-3.5" />
        {role.members.length}
      </span>
    </button>
  </li>
);

export const RolesList = ({
  roles,
  selectedId,
  onSelect,
  onCreate,
}: RolesListProps) => {
  const customRoles = roles.filter((r) => !r.isDefault);
  const defaultRole = roles.find((r) => r.isDefault);

  return (
    <section className="flex flex-col gap-2 rounded-[12px] border border-border-subtle bg-surface-100 px-2 py-3">
      <Button
        type="button"
        variant="subtle"
        className="mx-1 justify-start"
        onClick={onCreate}
      >
        <Plus />
        Создать роль
      </Button>

      <ul className="flex flex-col gap-px px-1" aria-label="Роли сервера">
        {customRoles.map((role) => (
          <RoleRow
            key={role.id}
            role={role}
            isSelected={role.id === selectedId}
            onSelect={() => onSelect(role.id)}
          />
        ))}
      </ul>

      {/* Роль по умолчанию — отдельно и последней: она ниже всех в иерархии. */}
      {defaultRole && (
        <ul
          className="flex flex-col gap-px border-t border-border-subtle px-1 pt-2"
          aria-label="Роль по умолчанию"
        >
          <RoleRow
            role={defaultRole}
            isSelected={defaultRole.id === selectedId}
            onSelect={() => onSelect(defaultRole.id)}
          />
        </ul>
      )}
    </section>
  );
};
