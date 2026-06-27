import { cn, Tooltip, TooltipContent, TooltipTrigger } from "@/shared";
import { Skeleton } from "@/shared/ui/skeleton";
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

const sideBarInnerButtonDefaultClass =
  "bg-accent p-2 rounded-xl w-12 h-12 flex items-center justify-center transition-colors hover:bg-accent/90";

export const SideBarSkeletonButton = () => {
  return <Skeleton className={sideBarInnerButtonDefaultClass} />;
};

interface SideBarInnerButtonProps extends PropsWithChildren<
  ComponentProps<"a">
> {
  to: string;
}

export const SideBarInnerButton = ({
  to,
  children,
  className,
  ...props
}: SideBarInnerButtonProps) => {
  return (
    <NavLink
      {...props}
      to={to}
      className={({ isActive }) =>
        cn(
          sideBarInnerButtonDefaultClass,
          { "bg-violet-600 hover:bg-violet-600": isActive },
          className,
        )
      }
    >
      {children}
    </NavLink>
  );
};
