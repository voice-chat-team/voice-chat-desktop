import type { GuildRole } from "@/entities/role";
import { Button, cn } from "@/shared";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Lock, Plus, UsersRound } from "lucide-react";

type RolesListProps = {
  roles: GuildRole[];
  selectedId: string;
  canCreate: boolean;
  /** Можно ли двигать роль: свою высшую и роли выше неё — нельзя. */
  canMove: (role: GuildRole) => boolean;
  onSelect: (id: string) => void;
  onCreate: () => void;
  /** Новый порядок ролей без @everyone, сверху вниз. */
  onReorder: (orderedIds: string[]) => void;
};

type RoleRowProps = {
  role: GuildRole;
  isSelected: boolean;
  isMovable: boolean;
  onSelect: () => void;
};

const RoleRowContent = ({
  role,
  isSelected,
  onSelect,
}: Omit<RoleRowProps, "isMovable">) => (
  <button
    type="button"
    onClick={onSelect}
    aria-current={isSelected ? "true" : undefined}
    className={cn(
      "relative flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 rounded-md px-2 py-[7px] text-left text-[15px] leading-5 font-medium text-text-secondary transition-colors outline-none hover:bg-surface-raised hover:text-text-primary focus-visible:bg-surface-raised",
      isSelected &&
        "bg-surface-raised font-semibold text-text-primary before:absolute before:top-1.5 before:bottom-1.5 before:-left-2 before:w-[3px] before:rounded-full before:bg-brand",
    )}
  >
    <span
      className="size-3 shrink-0 rounded-full"
      style={{ backgroundColor: role.color }}
    />
    <span className="min-w-0 flex-1 truncate">
      {role.name.trim() || "Без названия"}
    </span>
    <span
      className="flex shrink-0 items-center gap-1 text-xs text-text-faint tabular-nums"
      aria-label={`Участников: ${role.members.length}`}
    >
      <UsersRound className="size-3.5" />
      {role.members.length}
    </span>
  </button>
);

const SortableRoleRow = ({
  role,
  isSelected,
  isMovable,
  onSelect,
}: RoleRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: role.id, disabled: !isMovable });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group/role flex items-center",
        isDragging && "relative z-10 rounded-md bg-surface-300 shadow-lg",
      )}
    >
      {isMovable ? (
        <span
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Переместить роль ${role.name}`}
          title="Перетащите, чтобы изменить порядок"
          className="flex h-8 w-4 shrink-0 cursor-grab touch-none items-center justify-center rounded text-text-faint opacity-0 outline-none group-hover/role:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50 active:cursor-grabbing [@media(hover:none)]:opacity-100"
        >
          <GripVertical className="size-3.5" />
        </span>
      ) : (
        <span
          title="Роль на уровне вашей высшей роли или выше — её нельзя менять"
          className="flex h-8 w-4 shrink-0 items-center justify-center text-text-faint"
        >
          <Lock className="size-3" />
        </span>
      )}
      <RoleRowContent role={role} isSelected={isSelected} onSelect={onSelect} />
    </li>
  );
};

export const RolesList = ({
  roles,
  selectedId,
  canCreate,
  canMove,
  onSelect,
  onCreate,
  onReorder,
}: RolesListProps) => {
  const customRoles = roles.filter((r) => !r.isDefault);
  const defaultRole = roles.find((r) => r.isDefault);

  const sensors = useSensors(
    // distance — чтобы клик по строке не начинал перетаскивание.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const ids = customRoles.map((r) => r.id);
    const from = ids.indexOf(String(active.id));
    // Недоступные роли всегда наверху — выше них ставить нельзя.
    const firstMovable = customRoles.findIndex(canMove);
    const to = Math.max(ids.indexOf(String(over.id)), firstMovable);

    if (from === -1 || firstMovable === -1 || from === to) return;

    onReorder(arrayMove(ids, from, to));
  };

  return (
    <section className="flex flex-col gap-2 rounded-[12px] border border-border-subtle bg-surface-100 px-2 py-3">
      {canCreate && (
        <Button
          type="button"
          variant="subtle"
          className="mx-1 justify-start"
          onClick={onCreate}
        >
          <Plus />
          Создать роль
        </Button>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis, restrictToParentElement]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={customRoles.map((r) => r.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-px" aria-label="Роли сервера">
            {customRoles.map((role) => (
              <SortableRoleRow
                key={role.id}
                role={role}
                isSelected={role.id === selectedId}
                isMovable={canMove(role)}
                onSelect={() => onSelect(role.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {customRoles.length > 1 && (
        <p className="px-2 text-xs text-text-faint">
          Чем выше роль, тем больше её вес: цвет ника берётся у высшей роли.
        </p>
      )}

      {/* Роль по умолчанию — отдельно и последней: она ниже всех в иерархии. */}
      {defaultRole && (
        <ul
          className="flex flex-col gap-px border-t border-border-subtle pt-2 pl-4"
          aria-label="Роль по умолчанию"
        >
          <li className="flex">
            <RoleRowContent
              role={defaultRole}
              isSelected={defaultRole.id === selectedId}
              onSelect={() => onSelect(defaultRole.id)}
            />
          </li>
        </ul>
      )}
    </section>
  );
};
