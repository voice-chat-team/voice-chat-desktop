import { useGuildPermissions, useGuildRoleEvents } from "@/entities/role";
import {
  parseServerSettingsTab,
  ROUTES,
  ScrollArea,
  SERVER_SETTINGS_TABS,
  SETTINGS_TAB_PARAM,
  Tabs,
  TabsContent,
  type GuildDto,
  type PermissionKey,
  type ServerSettingsTab,
} from "@/shared";
import { Skeleton } from "@/shared/ui/skeleton";
import { Lock } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import {
  Navigate,
  useLoaderData,
  useNavigate,
  useRevalidator,
  useSearchParams,
} from "react-router";
import { toast } from "sonner";
import { GeneralSettingsTab } from "./components/general/GeneralSettingsTab";
import { RolesSettingsTab } from "./components/roles/RolesSettingsTab";

const TAB_HEADERS: Record<
  ServerSettingsTab,
  { title: string; description: string; permission: PermissionKey }
> = {
  [SERVER_SETTINGS_TABS.GENERAL]: {
    title: "Общие",
    description: "Название, описание и аватар сервера.",
    permission: "MANAGE_GUILD",
  },
  [SERVER_SETTINGS_TABS.ROLES]: {
    title: "Роли",
    description:
      "Роли группируют участников: задайте им цвет и права на сервере.",
    permission: "MANAGE_ROLES",
  },
};

const NoAccess = ({ children }: { children: ReactNode }) => (
  <p className="flex items-center gap-2 rounded-[12px] border border-border-subtle bg-surface-100 px-4 py-6 text-sm text-text-muted">
    <Lock className="size-4 shrink-0" />
    {children}
  </p>
);

const ServerSettingsContent = ({
  guild,
  activeTab,
}: {
  guild: GuildDto;
  activeTab: ServerSettingsTab;
}) => {
  const permissions = useGuildPermissions(guild.id);

  // Ссылку на настройки видно только с правами, но URL можно открыть и вручную.
  if (!permissions.has("MANAGE_GUILD") && !permissions.has("MANAGE_ROLES")) {
    return <Navigate to={ROUTES.SERVER(guild.id)} replace />;
  }

  const canOpen = (tab: ServerSettingsTab) =>
    permissions.has(TAB_HEADERS[tab].permission);

  return (
    <Tabs value={activeTab}>
      <TabsContent value={SERVER_SETTINGS_TABS.GENERAL}>
        {canOpen(SERVER_SETTINGS_TABS.GENERAL) ? (
          <GeneralSettingsTab key={guild.id} guild={guild} />
        ) : (
          <NoAccess>
            Менять название и описание сервера может только участник с правом
            «Управлять сервером».
          </NoAccess>
        )}
      </TabsContent>
      <TabsContent value={SERVER_SETTINGS_TABS.ROLES}>
        {canOpen(SERVER_SETTINGS_TABS.ROLES) ? (
          <RolesSettingsTab key={guild.id} guildId={guild.id} />
        ) : (
          <NoAccess>
            Настраивать роли может только участник с правом «Управлять
            ролями».
          </NoAccess>
        )}
      </TabsContent>
    </Tabs>
  );
};

const ServerSettingsPage = () => {
  const guild = useLoaderData<GuildDto>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const activeTab = parseServerSettingsTab(
    searchParams.get(SETTINGS_TAB_PARAM),
  );
  const header = TAB_HEADERS[activeTab];

  useGuildRoleEvents(guild.id, {
    // Список серверов в кэше уже обновлён — лоадер прочитает его заново.
    onGuildUpdated: () => void revalidator.revalidate(),
    onKicked: () => {
      toast.info(`Вас исключили с сервера «${guild.name}»`);
      void navigate(ROUTES.WELCOME, { replace: true });
    },
  });

  return (
    <ScrollArea className="h-full">
      <div className="@container flex w-full flex-col gap-6 px-6 py-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">
            {header.title}
          </h1>
          <p className="text-sm text-text-muted">{header.description}</p>
        </header>

        <Suspense fallback={<Skeleton className="h-64 w-full rounded-[12px]" />}>
          <ServerSettingsContent guild={guild} activeTab={activeTab} />
        </Suspense>
      </div>
    </ScrollArea>
  );
};

export default ServerSettingsPage;
