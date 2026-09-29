import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared";
import { InviteSection } from "./InviteSection";
import { MemberList } from "./MemberList";

interface ManageMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageMembersDialog({
  open,
  onOpenChange,
}: ManageMembersDialogProps) {
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
          <InviteSection />
          <MemberList />
        </div>
      </DialogContent>
    </Dialog>
  );
}
