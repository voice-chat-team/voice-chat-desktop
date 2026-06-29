import { createAbbr, ROUTES, useUserServers } from "@/shared";
import { Separator } from "@/shared/ui/separator";
import { Bell, Mic2, Settings } from "lucide-react";
import {
  SideBarActionButton,
  SideBarInnerButton,
  SideBarSkeletonButton,
} from "./SideBarButton";
import { lazy, Suspense } from "react";

const SideBarCreateServerButtonDynamic = lazy(
  () => import("./SideBarCreateServerButton"),
);

export function SideBarPanel() {
  const { data: guilds, isLoading: isLoadingGuilds } = useUserServers();

  return (
    <aside className="p-2 flex flex-col justify-between">
      <div className="flex flex-col gap-2">
        <SideBarActionButton tooltipContent={"Главная"}>
          <SideBarInnerButton to={ROUTES.WELCOME}>
            <Mic2 className=" text-white" size={25} />
          </SideBarInnerButton>
        </SideBarActionButton>

        <Separator />

        {!isLoadingGuilds ? (
          guilds?.map((guild) => (
            <SideBarActionButton key={guild.id} tooltipContent={guild.name}>
              <SideBarInnerButton to={ROUTES.SERVER(guild.id)}>
                <p className="font-medium">{createAbbr(guild.name, 2)}</p>
              </SideBarInnerButton>
            </SideBarActionButton>
          ))
        ) : (
          <SideBarSkeletonButton />
        )}

        <Suspense fallback={<SideBarSkeletonButton />}>
          <SideBarCreateServerButtonDynamic />
        </Suspense>
      </div>

      <div className="flex flex-col gap-2">
        <Separator />

        <SideBarActionButton tooltipContent={"Уведомления"}>
          <SideBarInnerButton
            to={"#"}
            className="bg-accent/20 hover:bg-accent/60"
          >
            <Bell />
          </SideBarInnerButton>
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
