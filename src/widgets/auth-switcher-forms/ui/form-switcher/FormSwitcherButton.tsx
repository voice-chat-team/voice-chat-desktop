import { cn } from "@/shared";
import { ComponentProps, PropsWithChildren } from "react";

interface FormSwitcherButtonProps extends PropsWithChildren<
  ComponentProps<"button">
> {
  isActive: boolean;
}

export function FormSwitcherButton({
  className,
  isActive,
  children,
  ...props
}: FormSwitcherButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        `flex-1 transition-all py-1.5 text-center font-medium bg-transparent text-gray-500 cursor-pointer rounded-lg`,
        className,
        {
          "bg-white text-gray-700": isActive,
        },
      )}
    >
      {children}
    </button>
  );
}
