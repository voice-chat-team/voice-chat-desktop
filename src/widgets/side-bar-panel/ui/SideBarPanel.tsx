import { ROUTES } from "@/shared";
import { Separator } from "@/shared/ui/separator";
import { Mic2, Plus, Settings } from "lucide-react";
import { SideBarActionButton, SideBarInnerButton } from "./SideBarButton";

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

        <SideBarActionButton tooltipContent={"Сервер #1"}>
          <SideBarInnerButton to={ROUTES.SERVER("general")}>
            <p className="font-medium">ОБ</p>
          </SideBarInnerButton>
        </SideBarActionButton>

        <SideBarActionButton tooltipContent={"Сервер #2"}>
          <SideBarInnerButton to={ROUTES.SERVER("games")}>
            <p className="font-medium">ИГ</p>
          </SideBarInnerButton>
        </SideBarActionButton>

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
