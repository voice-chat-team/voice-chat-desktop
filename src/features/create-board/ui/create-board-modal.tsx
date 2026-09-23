import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormInput,
} from "@/shared";

import { useCreateBoard } from "../hooks/useCreateBoard";

type CreateBoardModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string;
};

export const CreateBoardModal = ({
  open,
  onOpenChange,
  guildId,
}: CreateBoardModalProps) => {
  const onSuccesCreateCallBack = () => onOpenChange(false);

  const {
    form: {
      handleSubmit,
      register,
      formState: { isValid },
    },
    onSubmit,
  } = useCreateBoard(guildId, onSuccesCreateCallBack);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Создание доски</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Введите название доски — она появится в разделе «Доски» этой гильдии
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormInput
            labelTitle="Название"
            autoComplete="off"
            {...register("name", { required: true })}
          />
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button variant="default" type="submit" disabled={!isValid}>
              Создать доску
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
