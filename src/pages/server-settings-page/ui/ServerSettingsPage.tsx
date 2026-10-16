import {
  parseServerSettingsTab,
  ScrollArea,
  SERVER_SETTINGS_TABS,
  SETTINGS_TAB_PARAM,
  Tabs,
  TabsContent,
  type GuildDto,
  type ServerSettingsTab,
} from "@/shared";
import { useLoaderData, useSearchParams } from "react-router";
import { GeneralSettingsTab } from "./components/general/GeneralSettingsTab";
import { RolesSettingsTab } from "./components/roles/RolesSettingsTab";

const TAB_HEADERS: Record<
  ServerSettingsTab,
  { title: string; description: string }
> = {
  [SERVER_SETTINGS_TABS.GENERAL]: {
    title: "Общие",
    description: "Название, описание и аватар сервера.",
  },
  [SERVER_SETTINGS_TABS.ROLES]: {
    title: "Роли",
    description:
      "Роли группируют участников: задайте им цвет и права на сервере.",
  },
};

const ServerSettingsPage = () => {
  const guild = useLoaderData<GuildDto>();
  const [searchParams] = useSearchParams();
  const activeTab = parseServerSettingsTab(
    searchParams.get(SETTINGS_TAB_PARAM),
  );
  const header = TAB_HEADERS[activeTab];

  return (
    <ScrollArea className="h-full">
      <div className="@container flex w-full flex-col gap-6 px-6 py-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-text-primary">
            {header.title}
          </h1>
          <p className="text-sm text-text-muted">{header.description}</p>
        </header>

        <Tabs value={activeTab}>
          <TabsContent value={SERVER_SETTINGS_TABS.GENERAL}>
            <GeneralSettingsTab key={guild.id} guild={guild} />
          </TabsContent>
          <TabsContent value={SERVER_SETTINGS_TABS.ROLES}>
            <RolesSettingsTab key={guild.id} />
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};

export default ServerSettingsPage;
