import { createAbbr, ROUTES, useUserServers } from "@/shared";
import { Separator } from "@/shared/ui/separator";
import { Mic2, Plus } from "lucide-react";
import { SideBarActionButton, SideBarInnerButton } from "./SideBarButton";

export function SideBarPanel() {
  const { data: guilds } = useUserServers();

  return (
    <aside className="p-2 flex flex-col justify-between">
      <div className="flex flex-col gap-2">
        <SideBarActionButton tooltipContent={"Главная"}>
          <SideBarInnerButton to={ROUTES.WELCOME}>
            <Mic2 className=" text-white" size={25} />
          </SideBarInnerButton>
        </SideBarActionButton>

        <Separator />

        {guilds?.map((guild) => (
          <SideBarActionButton key={guild.id} tooltipContent={guild.name}>
            <SideBarInnerButton to={ROUTES.SERVER(guild.id)}>
              <p className="font-medium">{createAbbr(guild.name, 2)}</p>
            </SideBarInnerButton>
          </SideBarActionButton>
        ))}

        <SideBarActionButton
          tooltipContent={"Создать / Присоединиться к серверу / комнате"}
        >
          <SideBarInnerButton
            to={"#"}
            className="group hover:bg-green-600 bg-accent"
          >
            <Plus className="text-green-500 group-hover:text-white" size={25} />
          </SideBarInnerButton>
        </SideBarActionButton>
      </div>

      {/*<div>
        <SideBarActionButton tooltipContent={"Настройки приложения"}>
          <SideBarInnerButton
            to={"#"}
            className="bg-accent/50 hover:bg-accent/90"
          >
            <Settings />
          </SideBarInnerButton>
        </SideBarActionButton>
      </div>*/}
    </aside>
  );
}
