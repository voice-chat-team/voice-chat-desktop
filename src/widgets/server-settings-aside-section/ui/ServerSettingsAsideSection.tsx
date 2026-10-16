import {
  cn,
  parseServerSettingsTab,
  ROUTES,
  SERVER_SETTINGS_TABS,
  SETTINGS_TAB_PARAM,
  useUserServers,
  type ServerSettingsTab,
} from "@/shared";
import {
  ArrowLeft,
  Settings2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router";

const NAV_ITEMS: { tab: ServerSettingsTab; title: string; icon: LucideIcon }[] =
  [
    { tab: SERVER_SETTINGS_TABS.GENERAL, title: "Общие", icon: Settings2 },
    { tab: SERVER_SETTINGS_TABS.ROLES, title: "Роли", icon: ShieldCheck },
  ];

export const ServerSettingsAsideSection = () => {
  const { serverId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const activeTab = parseServerSettingsTab(
    searchParams.get(SETTINGS_TAB_PARAM),
  );

  const { data: guilds } = useUserServers();
  const guild = guilds.find((g) => g.id === serverId);

  return (
    <aside className="flex h-full flex-col gap-4 overflow-y-hidden bg-surface-100 px-2 py-3">
      <Link
        to={ROUTES.SERVER(serverId)}
        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-[7px] text-[15px] leading-5 font-medium text-text-secondary transition-colors outline-none hover:bg-surface-raised hover:text-text-primary focus-visible:bg-surface-raised"
      >
        <ArrowLeft className="size-4 text-text-faint" />
        Назад к серверу
      </Link>

      <nav className="flex flex-col gap-px">
        <p className="truncate px-2 py-1 text-xs leading-4 font-bold tracking-[0.04em] text-text-label uppercase">
          {guild?.name ?? "Сервер"}
        </p>
        {NAV_ITEMS.map(({ tab, title, icon: Icon }) => (
          <Link
            key={tab}
            to={`${ROUTES.SERVER_SETTINGS(serverId)}?${SETTINGS_TAB_PARAM}=${tab}`}
            replace
            aria-current={activeTab === tab ? "page" : undefined}
            className={cn(
              "relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-[7px] text-[15px] leading-5 font-medium text-text-secondary transition-colors outline-none hover:bg-surface-raised hover:text-text-primary focus-visible:bg-surface-raised [&_svg]:text-text-faint",
              activeTab === tab &&
                "bg-surface-raised font-bold text-text-primary before:absolute before:top-1.5 before:bottom-1.5 before:-left-2 before:w-[3px] before:rounded-full before:bg-brand [&_svg]:text-text-primary",
            )}
          >
            <Icon className="size-4" />
            {title}
          </Link>
        ))}
      </nav>
    </aside>
  );
};
