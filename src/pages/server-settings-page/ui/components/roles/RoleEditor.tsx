import {
  ALL_PERMISSION_KEYS,
  type GuildRole,
  type PermissionKey,
} from "@/entities/role";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type GuildMemberDto,
} from "@/shared";
import { Lock } from "lucide-react";
import { RoleDisplayPanel } from "./RoleDisplayPanel";
import { RoleMembersPanel } from "./RoleMembersPanel";
import { RolePermissionsPanel } from "./RolePermissionsPanel";

type RoleEditorProps = {
  role: GuildRole;
  guildMembers: GuildMemberDto[];
  /** Роль на уровне высшей роли пользователя или выше — только просмотр. */
  readOnly: boolean;
  /** Переключать можно только права, которые есть у самого пользователя. */
  canTogglePermission: (key: PermissionKey) => boolean;
  onChange: (patch: Partial<GuildRole>) => void;
  onDelete: () => void;
};

export const RoleEditor = ({
  role,
  guildMembers,
  readOnly,
  canTogglePermission,
  onChange,
  onDelete,
}: RoleEditorProps) => {
  const togglePermission = (key: PermissionKey, value: boolean) =>
    onChange({
      // Порядок как у сервера — иначе черновик отличался бы от него
      // только перестановкой и считался изменённым.
      permissions: ALL_PERMISSION_KEYS.filter((k) =>
        k === key ? value : role.permissions.includes(k),
      ),
    });

  const removeMember = (memberId: string) =>
    onChange({ members: role.members.filter((m) => m.id !== memberId) });

  const addMembers = (ids: string[]) => {
    const added = guildMembers
      .filter((m) => ids.includes(m.userId))
      .map((m) => ({
        id: m.userId,
        username: m.user.username,
        avatarUrl: m.user.avatarUrl || undefined,
      }));

    onChange({ members: [...role.members, ...added] });
  };

  return (
    <section className="flex min-w-0 flex-col gap-4 rounded-[12px] border border-border-subtle bg-surface-100 p-5">
      <header className="flex items-center gap-2.5">
        <span
          className="size-3.5 shrink-0 rounded-full"
          style={{ backgroundColor: role.color }}
        />
        <h2 className="truncate text-base leading-[22px] font-semibold text-text-primary">
          {role.name.trim() || "Без названия"}
        </h2>
      </header>

      {readOnly && (
        <p className="flex items-center gap-2 rounded-md bg-surface-200 px-3 py-2 text-sm text-text-muted">
          <Lock className="size-3.5 shrink-0" />
          Эта роль на уровне вашей высшей роли или выше — менять её может
          только тот, чья роль выше.
        </p>
      )}

      {/* key: у новой выбранной роли вкладка снова «Отображение». */}
      <Tabs key={role.id} defaultValue="display" className="gap-5">
        <TabsList
          variant="line"
          className="w-full justify-start border-b border-border-subtle pb-1"
        >
          <TabsTrigger value="display" className="flex-none px-2">
            Отображение
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex-none px-2">
            Права
          </TabsTrigger>
          <TabsTrigger value="members" className="flex-none px-2">
            Участники
            <span className="text-text-faint tabular-nums">
              {role.members.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="display">
          <RoleDisplayPanel
            role={role}
            readOnly={readOnly}
            onChange={onChange}
            onDelete={onDelete}
          />
        </TabsContent>
        <TabsContent value="permissions">
          <RolePermissionsPanel
            role={role}
            readOnly={readOnly}
            canToggle={canTogglePermission}
            onToggle={togglePermission}
          />
        </TabsContent>
        <TabsContent value="members">
          <RoleMembersPanel
            role={role}
            guildMembers={guildMembers}
            readOnly={readOnly}
            onAdd={addMembers}
            onRemove={removeMember}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
};
