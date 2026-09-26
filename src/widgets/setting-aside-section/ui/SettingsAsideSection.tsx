import {
  cn,
  parseSettingsTab,
  ROUTES,
  SETTINGS_TAB_PARAM,
  SETTINGS_TABS,
  type SettingsTab,
} from "@/shared";
import { ArrowLeft, UserRound, Volume2, type LucideIcon } from "lucide-react";
import { Link, useSearchParams } from "react-router";

const NAV_ITEMS: { tab: SettingsTab; title: string; icon: LucideIcon }[] = [
  { tab: SETTINGS_TABS.ACCOUNT, title: "Мой аккаунт", icon: UserRound },
  { tab: SETTINGS_TABS.AUDIO, title: "Голос и звук", icon: Volume2 },
];

export const SettingsAsideSection = () => {
  const [searchParams] = useSearchParams();
  const activeTab = parseSettingsTab(searchParams.get(SETTINGS_TAB_PARAM));

  return (
    <aside className="bg-zinc-900 h-svh p-2 flex flex-col gap-4 overflow-y-hidden">
      <Link
        to={ROUTES.WELCOME}
        className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </Link>

      <nav className="flex flex-col gap-1">
        <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Настройки пользователя
        </p>
        {NAV_ITEMS.map(({ tab, title, icon: Icon }) => (
          <Link
            key={tab}
            to={`${ROUTES.SETTINGS}?${SETTINGS_TAB_PARAM}=${tab}`}
            replace
            aria-current={activeTab === tab ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors cursor-pointer",
              activeTab === tab
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60",
            )}
          >
            <Icon className="w-4 h-4" />
            {title}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
