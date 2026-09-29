import { cn, Input, Label, Switch, Textarea } from "@/shared";
import { ComponentProps, PropsWithChildren, useId } from "react";

// Поля форм по дизайн-системе: фон surface-300, тонкая рамка, без кольца
// фокуса — вместо него светлеет рамка; подпись в стиле label (капс).
const fieldClass =
  "border-border-subtle bg-surface-300! text-text-primary placeholder:text-text-faint focus-visible:border-text-label focus-visible:ring-0";

const fieldLabelClass =
  "text-xs leading-4 font-bold tracking-[0.04em] text-text-label uppercase";

type FormInputProps = ComponentProps<"input"> & {
  labelTitle?: string;
  wrapperClassName?: string;
};

export const FormInput = ({
  labelTitle,
  wrapperClassName,
  className,
  ...props
}: FormInputProps) => {
  const id = useId();

  return (
    <FormControlWrapper className={wrapperClassName}>
      {labelTitle && (
        <Label htmlFor={id} className={fieldLabelClass}>
          {labelTitle}
        </Label>
      )}
      <Input {...props} id={id} className={cn("h-9", fieldClass, className)} />
    </FormControlWrapper>
  );
};

type FormTextareaProps = ComponentProps<"textarea"> & {
  labelTitle?: string;
};

export const FormTextarea = ({
  labelTitle,
  className,
  ...props
}: FormTextareaProps) => {
  const id = useId();

  return (
    <FormControlWrapper>
      {labelTitle && (
        <Label htmlFor={id} className={fieldLabelClass}>
          {labelTitle}
        </Label>
      )}
      <Textarea {...props} id={id} className={cn(fieldClass, className)} />
    </FormControlWrapper>
  );
};

type FormSwitchProps = {
  switchTitle?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export const FormSwitch = ({
  switchTitle,
  checked,
  onCheckedChange,
}: FormSwitchProps) => {
  const id = useId();

  return (
    <FormControlWrapper className="flex-row w-fit cursor-pointer">
      <Switch checked={checked} onCheckedChange={onCheckedChange} id={id} />
      <Label htmlFor={id} className="font-medium text-text-secondary">
        {switchTitle}
      </Label>
    </FormControlWrapper>
  );
};

const FormControlWrapper = ({
  children,
  className,
  ...props
}: PropsWithChildren<ComponentProps<"div">>) => {
  return (
    <div {...props} className={cn("flex flex-col gap-2", className)}>
      {children}
    </div>
  );
};
