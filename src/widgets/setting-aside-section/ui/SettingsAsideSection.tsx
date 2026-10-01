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
    <aside className="flex h-full flex-col gap-4 overflow-y-hidden bg-surface-100 px-2 py-3">
      <Link
        to={ROUTES.WELCOME}
        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-[7px] text-[15px] leading-5 font-medium text-text-secondary transition-colors outline-none hover:bg-surface-raised hover:text-text-primary focus-visible:bg-surface-raised"
      >
        <ArrowLeft className="size-4 text-text-faint" />
        Назад
      </Link>

      <nav className="flex flex-col gap-px">
        <p className="px-2 py-1 text-xs leading-4 font-bold tracking-[0.04em] text-text-label uppercase">
          Настройки пользователя
        </p>
        {NAV_ITEMS.map(({ tab, title, icon: Icon }) => (
          <Link
            key={tab}
            to={`${ROUTES.SETTINGS}?${SETTINGS_TAB_PARAM}=${tab}`}
            replace
            aria-current={activeTab === tab ? "page" : undefined}
            className={cn(
              "relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-[7px] text-[15px] leading-5 font-medium text-text-secondary transition-colors outline-none hover:bg-surface-raised hover:text-text-primary focus-visible:bg-surface-raised [&_svg]:text-text-faint",
              // Активный пункт — как активный канал: заливка, рулька brand, text-primary.
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
