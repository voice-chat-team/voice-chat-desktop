import { ErrorBoundary, ROUTES, Separator } from "@/shared";
import { Bell, Mic2, Settings } from "lucide-react";
import {
  SideBarActionButton,
  SideBarInnerButton,
  SideBarSkeletonButton,
} from "./SideBarButton";
import { lazy, Suspense } from "react";
import NotificationsPopover from "@/entities/notifications/ui/NotificationPopover";
import { SideBarGuildList } from "./SideBarGuildList";

const SideBarCreateServerButtonDynamic = lazy(
  () => import("./SideBarCreateServerButton"),
);

export function SideBarPanel() {
  return (
    <aside className="p-2 flex flex-col justify-between">
      <div className="flex flex-col gap-2">
        <SideBarActionButton tooltipContent={"Главная"}>
          <SideBarInnerButton to={ROUTES.WELCOME}>
            <Mic2 className=" text-white" size={25} />
          </SideBarInnerButton>
        </SideBarActionButton>

        <Separator />

        <ErrorBoundary fallback={<SideBarSkeletonButton />}>
          <Suspense fallback={<SideBarSkeletonButton />}>
            <SideBarGuildList />
          </Suspense>
        </ErrorBoundary>

        <Suspense fallback={<SideBarSkeletonButton />}>
          <SideBarCreateServerButtonDynamic />
        </Suspense>
      </div>

      <div className="flex flex-col gap-2">
        <Separator />

        <SideBarActionButton tooltipContent={"Уведомления"}>
          <NotificationsPopover>
            <SideBarInnerButton
              to={"#"}
              className="bg-accent/20 hover:bg-accent/60"
            >
              <Bell />
            </SideBarInnerButton>
          </NotificationsPopover>
        </SideBarActionButton>

        <SideBarActionButton tooltipContent={"Настройки приложения"}>
          <SideBarInnerButton
            to={"#"}
            className="bg-accent/20 hover:bg-accent/60"
          >
            <Settings />
          </SideBarInnerButton>
        </SideBarActionButton>
      </div>
    </aside>
  );
}
