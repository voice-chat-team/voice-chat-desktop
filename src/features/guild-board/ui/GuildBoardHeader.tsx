import { PencilRuler } from "lucide-react";
import type { BoardSaveStatus } from "@/shared";

const SAVE_STATUS_LABEL: Record<BoardSaveStatus, string> = {
  idle: "",
  pending: "Сохранение…",
  saved: "Сохранено",
};

type GuildBoardHeaderProps = {
  name: string;
  status: BoardSaveStatus;
};

export const GuildBoardHeader = ({ name, status }: GuildBoardHeaderProps) => {
  return (
    <div className="px-4 py-4 flex items-center justify-between gap-4">
      <h2 className="flex items-center gap-2 truncate">
        <PencilRuler size={15} />
        {name}
      </h2>
      <small className="text-accent shrink-0">{SAVE_STATUS_LABEL[status]}</small>
    </div>
  );
};
