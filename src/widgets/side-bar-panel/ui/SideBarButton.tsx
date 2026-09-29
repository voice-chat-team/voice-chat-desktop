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

const railIconClass =
  "flex size-11 items-center justify-center rounded-full text-[13px] font-bold text-text-on-brand select-none transition-[border-radius,background-color] duration-150 group-hover:rounded-squircle group-focus-visible:rounded-squircle";

const railItemClass =
  "group relative flex size-12 shrink-0 items-center justify-center outline-none";

export const SideBarSkeletonButton = () => {
  return (
    <div className={railItemClass}>
      <Skeleton className="size-11 rounded-full" />
    </div>
  );
};

interface SideBarInnerButtonProps extends PropsWithChildren<
  ComponentProps<"a">
> {
  to: string;
  colorClassName?: string;
}

export const SideBarInnerButton = ({
  to,
  children,
  className,
  colorClassName = "bg-surface-avatar-fallback text-text-secondary",
  ...props
}: SideBarInnerButtonProps) => {
  return (
    <NavLink {...props} to={to} className={cn(railItemClass, className)}>
      <span className="absolute -left-3.5 top-1/2 h-2 w-1 -translate-y-1/2 rounded-r-full bg-indicator-active opacity-0 transition-[height,opacity] duration-150 group-hover:opacity-100 group-aria-[current=page]:h-6 group-aria-[current=page]:opacity-100" />
      <span
        className={cn(
          railIconClass,
          colorClassName,
          "group-aria-[current=page]:rounded-squircle group-aria-[current=page]:bg-brand group-aria-[current=page]:text-text-on-brand",
        )}
      >
        {children}
      </span>
    </NavLink>
  );
};

export const SideBarCreateButton = ({
  children,
  className,
  ...props
}: ComponentProps<"button">) => {
  return (
    <button
      type="button"
      {...props}
      className={cn(railItemClass, "cursor-pointer", className)}
    >
      <span className={cn(railIconClass, "bg-status-online")}>{children}</span>
    </button>
  );
};

export const sideBarIconButtonClass =
  "relative flex size-8 cursor-pointer items-center justify-center rounded-md text-text-faint transition-colors outline-none hover:bg-surface-raised hover:text-text-secondary focus-visible:bg-surface-raised aria-[current=page]:bg-surface-raised aria-[current=page]:text-text-primary [&_svg]:size-[18px]";
