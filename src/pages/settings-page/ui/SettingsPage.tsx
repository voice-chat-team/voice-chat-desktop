import {
  parseSettingsTab,
  ScrollArea,
  SETTINGS_TAB_PARAM,
  SETTINGS_TABS,
  Tabs,
  TabsContent,
  type SettingsTab,
} from "@/shared";
import { useSearchParams } from "react-router";
import { AccountSettingsTab } from "./components/AccountSettingsTab";
import { AudioSettingsTab } from "./components/AudioSettingsTab";

const TAB_HEADERS: Record<SettingsTab, { title: string; description: string }> =
  {
    [SETTINGS_TABS.ACCOUNT]: {
      title: "Мой аккаунт",
      description: "Управляйте профилем, личными данными и безопасностью.",
    },
    [SETTINGS_TABS.AUDIO]: {
      title: "Голос и звук",
      description: "Настройте устройства и параметры звука для голосовых каналов.",
    },
  };

const SettingsPage = () => {
  const [searchParams] = useSearchParams();
  const activeTab = parseSettingsTab(searchParams.get(SETTINGS_TAB_PARAM));
  const header = TAB_HEADERS[activeTab];

  return (
    <ScrollArea className="h-full">
      <div className="flex w-full flex-col gap-6 px-6 py-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-white">{header.title}</h1>
          <p className="text-sm text-zinc-400">{header.description}</p>
        </header>

        <Tabs value={activeTab}>
          <TabsContent value={SETTINGS_TABS.ACCOUNT}>
            <AccountSettingsTab />
          </TabsContent>
          <TabsContent value={SETTINGS_TABS.AUDIO}>
            <AudioSettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};

export default SettingsPage;
