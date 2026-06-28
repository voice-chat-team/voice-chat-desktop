import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormInput,
  FormSwitch,
  FormTextarea,
} from "@/shared";
import { useCreateServer } from "../hooks";
import { Controller } from "react-hook-form";

type CreateNewServerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CreateNewServerModal = ({
  open,
  onOpenChange,
}: CreateNewServerModalProps) => {
  const onSuccesCreateCallBack = () => onOpenChange(false);

  const {
    form: {
      handleSubmit,
      control,
      register,
      formState: { isValid },
    },
    onSubmit,
  } = useCreateServer(onSuccesCreateCallBack);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
        <DialogHeader>
          <DialogTitle>Создание нового сервера</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Введите название и описание для вашего сервера
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <FormInput
              labelTitle="Название"
              autoComplete="off"
              {...register("name", { required: true })}
            />
            <FormTextarea
              labelTitle="Описание"
              autoComplete="off"
              {...register("description")}
            />
            <Controller
              control={control}
              name="isPublic"
              render={({ field: { value, onChange } }) => (
                <FormSwitch
                  switchTitle="Публичный сервер"
                  checked={value}
                  onCheckedChange={onChange}
                />
              )}
            />
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
              Создать сервер
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
