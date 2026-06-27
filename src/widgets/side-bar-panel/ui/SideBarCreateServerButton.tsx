import { useState } from "react";
import { SideBarActionButton, SideBarInnerButton } from "./SideBarButton";
import { Plus } from "lucide-react";
import { CreateNewServerModal } from "@/features";

function SideBarCreateServerButton() {
  const [isOpenCreateServerModal, setIsOpenCreateServerModal] = useState(false);

  return (
    <>
      <SideBarActionButton
        tooltipContent={"Создать / Присоединиться к серверу / комнате"}
      >
        <SideBarInnerButton
          to={"#"}
          onClick={() => setIsOpenCreateServerModal(true)}
          className="group hover:bg-green-600 bg-accent"
        >
          <Plus className="text-green-500 group-hover:text-white" size={25} />
        </SideBarInnerButton>
      </SideBarActionButton>

      <CreateNewServerModal
        open={isOpenCreateServerModal}
        onOpenChange={setIsOpenCreateServerModal}
      />
    </>
  );
}

export default SideBarCreateServerButton;
