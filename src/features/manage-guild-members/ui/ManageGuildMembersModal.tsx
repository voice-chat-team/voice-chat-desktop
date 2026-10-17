import { useGuildPermissions } from "@/entities/role";
import { useServerStore } from "@/entities/server";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared";
import { Suspense } from "react";
import { InviteSection } from "./InviteSection";
import { MemberList } from "./MemberList";

interface ManageMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const InviteSectionGate = ({ guildId }: { guildId: string }) =>
  useGuildPermissions(guildId).has("INVITE_MEMBERS") ? <InviteSection /> : null;

export function ManageMembersDialog({
  open,
  onOpenChange,
}: ManageMembersDialogProps) {
  const guildId = useServerStore((s) => s.state.guild?.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-xl">
        <DialogHeader>
          <DialogTitle>Управление участниками сервера</DialogTitle>
          <DialogDescription>
            Приглашайте участников и управляйте их правами
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <Suspense fallback={null}>
            {guildId && <InviteSectionGate guildId={guildId} />}
            <MemberList />
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
}
