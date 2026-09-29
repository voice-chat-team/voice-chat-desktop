import { useState } from "react";
import { SideBarActionButton, SideBarCreateButton } from "./SideBarButton";
import { Plus } from "lucide-react";
import { CreateNewServerModal } from "@/features";

function SideBarCreateServerButton() {
  const [isOpenCreateServerModal, setIsOpenCreateServerModal] = useState(false);

  return (
    <>
      <SideBarActionButton
        tooltipContent={"Создать / Присоединиться к серверу / комнате"}
      >
        <SideBarCreateButton onClick={() => setIsOpenCreateServerModal(true)}>
          <Plus size={20} strokeWidth={1.8} />
        </SideBarCreateButton>
      </SideBarActionButton>

      <CreateNewServerModal
        open={isOpenCreateServerModal}
        onOpenChange={setIsOpenCreateServerModal}
      />
    </>
  );
}

export default SideBarCreateServerButton;
