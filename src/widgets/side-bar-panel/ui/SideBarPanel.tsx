import { ErrorBoundary, ROUTES } from "@/shared";
import { Bell, Mic2, Settings } from "lucide-react";
import {
  SideBarActionButton,
  SideBarInnerButton,
  SideBarSkeletonButton,
  sideBarIconButtonClass,
} from "./SideBarButton";
import { lazy, Suspense } from "react";
import { NavLink } from "react-router";
import NotificationsPopover from "@/entities/notifications/ui/NotificationPopover";
import { SideBarGuildList } from "./SideBarGuildList";

const SideBarCreateServerButtonDynamic = lazy(
  () => import("./SideBarCreateServerButton"),
);

const RailDivider = () => (
  <div className="my-1 h-0.5 w-8 shrink-0 rounded-full bg-border-subtle" />
);

export function SideBarPanel() {
  return (
    <aside className="flex h-svh w-19 shrink-0 flex-col items-center justify-between bg-surface-000 py-3">
      <div className="flex min-h-0 w-full flex-col items-center gap-2 overflow-y-auto px-3.5 scrollbar-none">
        <SideBarActionButton tooltipContent={"Главная"}>
          <SideBarInnerButton to={ROUTES.WELCOME}>
            <Mic2 size={22} />
          </SideBarInnerButton>
        </SideBarActionButton>

        <RailDivider />

        <ErrorBoundary fallback={<SideBarSkeletonButton />}>
          <Suspense fallback={<SideBarSkeletonButton />}>
            <SideBarGuildList />
          </Suspense>
        </ErrorBoundary>

        <Suspense fallback={<SideBarSkeletonButton />}>
          <SideBarCreateServerButtonDynamic />
        </Suspense>
      </div>

      <div className="flex flex-col items-center gap-2 pt-2">
        <RailDivider />

        <NotificationsPopover>
          <button
            type="button"
            className={sideBarIconButtonClass}
            aria-label="Уведомления"
          >
            <Bell strokeWidth={1.6} />
          </button>
        </NotificationsPopover>

        <SideBarActionButton tooltipContent={"Настройки приложения"}>
          <NavLink to={ROUTES.SETTINGS} className={sideBarIconButtonClass}>
            <Settings strokeWidth={1.6} />
          </NavLink>
        </SideBarActionButton>
      </div>
    </aside>
  );
}
