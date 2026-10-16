import {
  DEFAULT_ROLE_COLOR,
  MOCK_GUILD_ROLES,
  type GuildRole,
} from "@/entities/role";
import { useState } from "react";
import { UnsavedChangesBar } from "../UnsavedChangesBar";
import { RoleEditor } from "./RoleEditor";
import { RolesList } from "./RolesList";

// Только вёрстка: ролей на бэкенде ещё нет. Правки живут в локальном стейте
// поверх моков, «Сохранить изменения» ничего не отправляет.
export const RolesSettingsTab = () => {
  const [roles, setRoles] = useState<GuildRole[]>(MOCK_GUILD_ROLES);
  const [selectedId, setSelectedId] = useState(
    () => (roles.find((r) => !r.isDefault) ?? roles[0]).id,
  );

  const selectedRole = roles.find((r) => r.id === selectedId) ?? roles[0];
  const hasChanges = JSON.stringify(roles) !== JSON.stringify(MOCK_GUILD_ROLES);

  const updateSelectedRole = (patch: Partial<GuildRole>) =>
    setRoles((current) =>
      current.map((r) => (r.id === selectedRole.id ? { ...r, ...patch } : r)),
    );

  const createRole = () => {
    const defaultRole = roles.find((r) => r.isDefault);
    const role: GuildRole = {
      id: `role-${crypto.randomUUID()}`,
      name: "Новая роль",
      color: DEFAULT_ROLE_COLOR,
      members: [],
      // Новая роль начинается с прав @everyone — их и так есть у всех.
      permissions: { ...(defaultRole ?? roles[0]).permissions },
    };

    setRoles((current) => [role, ...current]);
    setSelectedId(role.id);
  };

  const deleteSelectedRole = () => {
    if (selectedRole.isDefault) return;

    const rest = roles.filter((r) => r.id !== selectedRole.id);
    setRoles(rest);
    setSelectedId(rest[0].id);
  };

  const resetChanges = () => {
    setRoles(MOCK_GUILD_ROLES);
    if (!MOCK_GUILD_ROLES.some((r) => r.id === selectedId)) {
      setSelectedId(MOCK_GUILD_ROLES[0].id);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid items-start gap-4 @3xl:grid-cols-[240px_minmax(0,1fr)]">
        <RolesList
          roles={roles}
          selectedId={selectedRole.id}
          onSelect={setSelectedId}
          onCreate={createRole}
        />
        <RoleEditor
          role={selectedRole}
          onChange={updateSelectedRole}
          onDelete={deleteSelectedRole}
        />
      </div>

      {hasChanges && (
        <UnsavedChangesBar onReset={resetChanges} onSave={() => {}} />
      )}
    </div>
  );
};
