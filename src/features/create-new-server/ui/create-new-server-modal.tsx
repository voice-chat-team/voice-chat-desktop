import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared";
import { FormInput, FormSwitch, FormTextarea } from "./form-controls";

type CreateNewServerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CreateNewServerModal = ({
  open,
  onOpenChange,
}: CreateNewServerModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Создание нового сервера</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Введите название и описание для вашего сервера
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <FormInput labelTitle="Название" />
          <FormTextarea labelTitle="Описание" />
          <FormSwitch switchTitle="Частный сервер" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button variant="default">Создать сервер</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
