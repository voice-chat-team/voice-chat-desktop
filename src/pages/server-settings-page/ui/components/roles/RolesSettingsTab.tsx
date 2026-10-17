import {
  DEFAULT_ROLE_COLOR,
  useGuildPermissions,
  type GuildRole,
} from "@/entities/role";
import {
  getApiErrorMessage,
  guildMembersQueryKey,
  guildRolesQueryKey,
  useGuildMembers,
  useGuildRoles,
} from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { buildGuildRoles, saveRoleChanges } from "../../../lib/roles-draft";
import { UnsavedChangesBar } from "../UnsavedChangesBar";
import { RoleEditor } from "./RoleEditor";
import { RolesList } from "./RolesList";

type Draft = {
  /** Серверное состояние на момент первой правки — от него считается разница. */
  base: GuildRole[];
  roles: GuildRole[];
};

/**
 * Правки копятся в черновике и уходят на сервер разом по «Сохранить». Пока
 * черновика нет, экран показывает серверное состояние как есть — вместе
 * с изменениями других участников, прилетающими по realtime.
 */
export const RolesSettingsTab = ({ guildId }: { guildId: string }) => {
  const queryClient = useQueryClient();
  const { data: serverRoleDtos } = useGuildRoles(guildId);
  const { data: members } = useGuildMembers(guildId);
  const permissions = useGuildPermissions(guildId);

  const serverRoles = useMemo(
    () => buildGuildRoles(serverRoleDtos, members),
    [serverRoleDtos, members],
  );

  const [draft, setDraft] = useState<Draft | null>(null);
  const roles = draft?.roles ?? serverRoles;

  const [selectedId, setSelectedId] = useState(
    () => (roles.find((r) => !r.isDefault) ?? roles[0]).id,
  );
  const selectedRole = roles.find((r) => r.id === selectedId) ?? roles[0];

  const hasChanges =
    draft !== null && JSON.stringify(draft.roles) !== JSON.stringify(draft.base);

  const edit = (update: (current: GuildRole[]) => GuildRole[]) =>
    setDraft((current) => {
      const base = current?.base ?? serverRoles;
      return { base, roles: update(current?.roles ?? serverRoles) };
    });

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: (current: Draft) =>
      saveRoleChanges(guildId, current.base, current.roles),
    onSuccess: (createdIds) => {
      toast.success("Роли сохранены");
      setSelectedId((id) => createdIds.get(id) ?? id);
    },
    onError: (error) => {
      // Часть запросов могла пройти — черновик сбрасываем к тому, что
      // реально лежит на сервере.
      toast.error(
        getApiErrorMessage(error, "Не удалось сохранить все изменения ролей"),
      );
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: guildRolesQueryKey(guildId) }),
        queryClient.invalidateQueries({
          queryKey: guildMembersQueryKey(guildId),
        }),
      ]);
      setDraft(null);
    },
  });

  const updateSelectedRole = (patch: Partial<GuildRole>) =>
    edit((current) =>
      current.map((r) => (r.id === selectedRole.id ? { ...r, ...patch } : r)),
    );

  const createRole = () => {
    const defaultRole = roles.find((r) => r.isDefault);
    const role: GuildRole = {
      id: `new-${crypto.randomUUID()}`,
      name: "Новая роль",
      color: DEFAULT_ROLE_COLOR,
      position: 0,
      members: [],
      // Новая роль начинается с прав @everyone — их и так есть у всех.
      permissions: [...(defaultRole?.permissions ?? [])],
      isNew: true,
    };

    // Как и на сервере — сразу над @everyone, ниже всех остальных ролей.
    edit((current) => [
      ...current.filter((r) => !r.isDefault),
      role,
      ...current.filter((r) => r.isDefault),
    ]);
    setSelectedId(role.id);
  };

  const deleteSelectedRole = () => {
    if (selectedRole.isDefault) return;

    const rest = roles.filter((r) => r.id !== selectedRole.id);
    edit(() => rest);
    setSelectedId((rest.find((r) => !r.isDefault) ?? rest[0]).id);
  };

  const moveRole = (orderedCustomIds: string[]) =>
    edit((current) => {
      const byId = new Map(current.map((r) => [r.id, r]));
      return [
        ...orderedCustomIds.map((id) => byId.get(id)!),
        ...current.filter((r) => r.isDefault),
      ];
    });

  const canManage = (role: GuildRole) =>
    role.isNew === true || permissions.canManageRole(role);

  const hasEmptyName = roles.some((r) => !r.isDefault && !r.name.trim());

  return (
    <div className="flex flex-col gap-6">
      <div className="grid items-start gap-4 @3xl:grid-cols-[240px_minmax(0,1fr)]">
        <RolesList
          roles={roles}
          selectedId={selectedRole.id}
          canCreate={permissions.has("MANAGE_ROLES")}
          canMove={canManage}
          onSelect={setSelectedId}
          onCreate={createRole}
          onReorder={moveRole}
        />
        <RoleEditor
          role={selectedRole}
          guildMembers={members}
          readOnly={!canManage(selectedRole)}
          canTogglePermission={(key) =>
            permissions.isOwner || permissions.has(key)
          }
          onChange={updateSelectedRole}
          onDelete={deleteSelectedRole}
        />
      </div>

      {hasChanges && (
        <UnsavedChangesBar
          onReset={() => setDraft(null)}
          onSave={() => draft && save(draft)}
          canSave={!isSaving && !hasEmptyName}
        />
      )}
    </div>
  );
};
