import { Button } from "@/shared";

type UnsavedChangesBarProps = {
  onReset: () => void;
  onSave?: () => void;
  canSave?: boolean;
};

export const UnsavedChangesBar = ({
  onReset,
  onSave,
  canSave = true,
}: UnsavedChangesBarProps) => {
  return (
    <div
      role="status"
      className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-border-subtle bg-surface-300 px-4 py-3 shadow-lg motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2"
    >
      <p className="text-sm font-medium text-text-primary">
        Есть несохранённые изменения
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="subtle" onClick={onReset}>
          Отменить
        </Button>
        <Button
          type={onSave ? "button" : "submit"}
          variant="brand"
          disabled={!canSave}
          onClick={onSave}
        >
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
};
