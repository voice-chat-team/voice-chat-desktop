import { cn, Tooltip, TooltipContent, TooltipTrigger } from "@/shared";
import { ComponentProps, PropsWithChildren } from "react";
import { NavLink } from "react-router";

interface SideBarButtonProps extends PropsWithChildren {
  tooltipContent: string;
}

export const SideBarActionButton = ({
  tooltipContent,
  children,
}: SideBarButtonProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">
        <p>{tooltipContent}</p>
      </TooltipContent>
    </Tooltip>
  );
};

interface SideBarInnerButtonProps extends PropsWithChildren<
  ComponentProps<"a">
> {
  to: string;
  isActive?: boolean;
}

export const SideBarInnerButton = ({
  to,
  children,
  className,
  isActive = false,
  ...props
}: SideBarInnerButtonProps) => {
  return (
    <NavLink
      {...props}
      to={to}
      className={cn(
        "bg-accent p-2 rounded-xl w-12 h-12 flex items-center justify-center transition-colors hover:bg-accent/90",
        { "bg-violet-600 hover:bg-violet-600": isActive },
        className,
      )}
    >
      {children}
    </NavLink>
  );
};
