import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared";
import { FormInput, FormSwitch } from "./form-controls";
import { useCreateChannel } from "../hooks/useCreateChannel";

type CreateChannelModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string;
};

export const CreateChannelModal = ({
  open,
  onOpenChange,
  guildId,
}: CreateChannelModalProps) => {
  const onSuccesCreateCallBack = () => onOpenChange(false);

  const {
    form: {
      handleSubmit,
      register,
      formState: { isValid },
    },
    onSubmit,
  } = useCreateChannel(guildId, onSuccesCreateCallBack);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Создание текстового канала</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Введите название канала и выберите его тип
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <FormInput
              labelTitle="Название"
              autoComplete="off"
              {...register("name", { required: true })}
            />
            <FormSwitch switchTitle="Закрытый канал" />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button variant="default" type="submit" disabled={!isValid}>
              Создать канал
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
