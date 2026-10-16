import type { GuildRole, PermissionKey } from "@/entities/role";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared";
import { RoleDisplayPanel } from "./RoleDisplayPanel";
import { RoleMembersPanel } from "./RoleMembersPanel";
import { RolePermissionsPanel } from "./RolePermissionsPanel";

type RoleEditorProps = {
  role: GuildRole;
  onChange: (patch: Partial<GuildRole>) => void;
  onDelete: () => void;
};

export const RoleEditor = ({ role, onChange, onDelete }: RoleEditorProps) => {
  const togglePermission = (key: PermissionKey, value: boolean) =>
    onChange({ permissions: { ...role.permissions, [key]: value } });

  const removeMember = (memberId: string) =>
    onChange({ members: role.members.filter((m) => m.id !== memberId) });

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
            onChange={onChange}
            onDelete={onDelete}
          />
        </TabsContent>
        <TabsContent value="permissions">
          <RolePermissionsPanel role={role} onToggle={togglePermission} />
        </TabsContent>
        <TabsContent value="members">
          <RoleMembersPanel role={role} onRemove={removeMember} />
        </TabsContent>
      </Tabs>
    </section>
  );
};
