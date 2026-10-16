import { ROLE_COLORS, type GuildRole } from "@/entities/role";
import {
  Avatar,
  AvatarFallback,
  Button,
  cn,
  FormInput,
  getAvatarColorClass,
  Label,
} from "@/shared";
import { Check, Pipette, Trash2 } from "lucide-react";
import { useId } from "react";

const PREVIEW_AUTHOR = { id: "mock-1", username: "anya.k" };

type RoleDisplayPanelProps = {
  role: GuildRole;
  onChange: (patch: Partial<GuildRole>) => void;
  onDelete: () => void;
};

const labelClass =
  "text-xs leading-4 font-bold tracking-[0.04em] text-text-label uppercase";

export const RoleDisplayPanel = ({
  role,
  onChange,
  onDelete,
}: RoleDisplayPanelProps) => {
  const customColorId = useId();
  const isPresetColor = (ROLE_COLORS as readonly string[]).includes(role.color);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <FormInput
          labelTitle="Название роли"
          value={role.name}
          maxLength={50}
          disabled={role.isDefault}
          onChange={(e) => onChange({ name: e.target.value })}
        />
        {role.isDefault && (
          <p className="text-xs text-text-muted">
            Роль @everyone есть у всех участников, её нельзя переименовать или
            удалить.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <p className={labelClass}>Цвет</p>
        <div
          role="radiogroup"
          aria-label="Цвет роли"
          className="flex flex-wrap gap-2"
        >
          {ROLE_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={role.color === color}
              aria-label={color}
              onClick={() => onChange({ color })}
              className={cn(
                "flex size-8 cursor-pointer items-center justify-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                role.color === color &&
                  "ring-2 ring-text-primary ring-offset-2 ring-offset-surface-100",
              )}
              style={{ backgroundColor: color }}
            >
              {role.color === color && (
                <Check className="size-4 text-surface-000" strokeWidth={3} />
              )}
            </button>
          ))}

          <Label
            htmlFor={customColorId}
            title="Свой цвет"
            className={cn(
              "relative flex size-8 cursor-pointer items-center justify-center rounded-md border border-dashed border-text-faint text-text-faint transition-colors hover:text-text-primary has-focus-visible:ring-3 has-focus-visible:ring-ring/50",
              !isPresetColor &&
                "border-solid border-transparent text-surface-000 ring-2 ring-text-primary ring-offset-2 ring-offset-surface-100",
            )}
            style={isPresetColor ? undefined : { backgroundColor: role.color }}
          >
            <Pipette className="size-4" />
            <span className="sr-only">Свой цвет</span>
            <input
              id={customColorId}
              type="color"
              value={role.color}
              onChange={(e) => onChange({ color: e.target.value })}
              className="absolute inset-0 size-full cursor-pointer opacity-0"
            />
          </Label>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className={labelClass}>Как это выглядит в чате</p>
        {/* Разметка повторяет GuildChatMessage — меняется только цвет ника. */}
        <div className="flex gap-2 rounded-[12px] border border-border-subtle bg-surface-200 p-4">
          <Avatar className="mt-0.5 size-9">
            <AvatarFallback
              className={cn(
                "text-sm font-semibold text-text-on-brand",
                getAvatarColorClass(PREVIEW_AUTHOR.id),
              )}
            >
              {PREVIEW_AUTHOR.username.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <span
                className="truncate text-[15px] leading-5 font-semibold"
                style={{ color: role.color }}
              >
                {PREVIEW_AUTHOR.username}
              </span>
              <span className="shrink-0 text-xs leading-4 font-medium text-text-muted">
                19:42
              </span>
            </div>
            <p className="text-[15px] leading-[22px] wrap-break-word text-text-secondary">
              Созвон в восемь, ссылка в голосовом канале.
            </p>
          </div>
        </div>
      </div>

      {!role.isDefault && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-status-dnd/40 bg-status-dnd/5 p-4">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-text-primary">
              Удалить роль
            </p>
            <p className="text-sm text-text-muted">
              Участники потеряют права этой роли. Действие нельзя отменить.
            </p>
          </div>
          <Button type="button" variant="destructive" onClick={onDelete}>
            <Trash2 />
            Удалить роль
          </Button>
        </div>
      )}
    </div>
  );
};
