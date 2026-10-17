import {
  PERMISSION_GROUPS,
  type GuildRole,
  type PermissionKey,
} from "@/entities/role";
import { FormInput, Label, Switch } from "@/shared";
import { useState } from "react";

type RolePermissionsPanelProps = {
  role: GuildRole;
  readOnly?: boolean;
  canToggle: (key: PermissionKey) => boolean;
  onToggle: (key: PermissionKey, value: boolean) => void;
};

export const RolePermissionsPanel = ({
  role,
  readOnly = false,
  canToggle,
  onToggle,
}: RolePermissionsPanelProps) => {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const groups = PERMISSION_GROUPS.map((group) => ({
    ...group,
    permissions: group.permissions.filter(
      (p) =>
        !normalizedQuery ||
        p.title.toLowerCase().includes(normalizedQuery) ||
        p.description.toLowerCase().includes(normalizedQuery),
    ),
  })).filter((group) => group.permissions.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <FormInput
        type="search"
        placeholder="Найти право"
        aria-label="Найти право"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {role.isDefault && (
        <p className="text-sm text-text-muted">
          Права @everyone действуют для всех участников сервера, даже без других
          ролей.
        </p>
      )}

      {groups.length === 0 && (
        <p className="py-6 text-center text-sm text-text-muted">
          Нет прав по запросу «{query.trim()}». Попробуйте другое слово.
        </p>
      )}

      {groups.map((group) => (
        <section key={group.title} className="flex flex-col gap-1">
          <h3 className="text-sm font-semibold text-text-primary">
            {group.title}
          </h3>
          <ul className="flex flex-col divide-y divide-border-subtle">
            {group.permissions.map((permission) => {
              const id = `permission-${permission.key}`;
              const isLocked = !readOnly && !canToggle(permission.key);

              return (
                <li
                  key={permission.key}
                  className="flex items-center justify-between gap-6 py-3"
                >
                  <Label
                    htmlFor={id}
                    className="flex cursor-pointer flex-col items-start gap-0.5"
                  >
                    <span className="text-[15px] font-medium text-text-primary">
                      {permission.title}
                    </span>
                    <span className="text-sm font-normal text-text-muted">
                      {permission.description}
                    </span>
                    {isLocked && (
                      <span className="text-xs font-normal text-text-faint">
                        Этого права нет у вас — менять его нельзя.
                      </span>
                    )}
                  </Label>
                  <Switch
                    id={id}
                    checked={role.permissions.includes(permission.key)}
                    disabled={readOnly || isLocked}
                    onCheckedChange={(value) => onToggle(permission.key, value)}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};
