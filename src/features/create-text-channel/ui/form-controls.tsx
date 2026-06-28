import { cn, Input, Label, Switch, Textarea } from "@/shared";
import { ComponentProps, PropsWithChildren, useId } from "react";

type FormInputProps = ComponentProps<"input"> & {
  labelTitle?: string;
};

export const FormInput = ({ labelTitle, ...props }: FormInputProps) => {
  const id = useId();

  return (
    <FormControlWrapper>
      {labelTitle && <Label htmlFor={id}>{labelTitle}</Label>}
      <Input {...props} id={id} />
    </FormControlWrapper>
  );
};

type FormTextareaProps = ComponentProps<"textarea"> & {
  labelTitle?: string;
};

export const FormTextarea = ({ labelTitle, ...props }: FormTextareaProps) => {
  const id = useId();

  return (
    <FormControlWrapper>
      {labelTitle && <Label htmlFor={id}>{labelTitle}</Label>}
      <Textarea {...props} id={id} />
    </FormControlWrapper>
  );
};

type FormSwitchProps = ComponentProps<"button"> & {
  switchTitle?: string;
};

export const FormSwitch = ({ switchTitle, ...props }: FormSwitchProps) => {
  const id = useId();

  return (
    <FormControlWrapper className="flex-row w-fit cursor-pointer">
      <Switch {...props} id={id} />
      <Label htmlFor={id}>{switchTitle}</Label>
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
