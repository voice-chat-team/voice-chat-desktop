import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  cn,
  createAbbr,
  getAvatarColorClass,
  UserProfileDto,
} from "@/shared";
import { Crown } from "lucide-react";
import {
  ComponentProps,
  KeyboardEvent,
  PropsWithChildren,
  ReactNode,
} from "react";

interface ServerAsideListProps {
  renderTitle: () => ReactNode;
  renderTitleButton?: () => ReactNode;
  renderList: () => ReactNode;
}

export const ServerAsideList = ({
  renderTitle,
  renderTitleButton,
  renderList,
}: ServerAsideListProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-2 py-1 text-xs leading-4 font-bold tracking-[0.04em] text-text-label uppercase">
        {renderTitle()}
        {renderTitleButton && renderTitleButton()}
      </div>

      {renderList()}
    </div>
  );
};

export const ServerAsideListTitle = ({
  children,
  ...props
}: PropsWithChildren<ComponentProps<"p">>) => {
  return (
    <div
      {...props}
      className={cn(
        "flex w-full min-w-0 items-center gap-1.5 truncate",
        props.className,
      )}
    >
      {children}
    </div>
  );
};

/** Кнопка справа от заголовка секции («+», пригласить). */
export const ServerAsideListTitleButton = ({
  className,
  type = "button",
  ...props
}: ComponentProps<"button">) => {
  return (
    <button
      type={type}
      {...props}
      className={cn(
        "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md text-text-faint transition-colors outline-none hover:bg-surface-raised hover:text-text-secondary focus-visible:bg-surface-raised [&_svg]:size-4",
        className,
      )}
    />
  );
};

export const ServerAsideUnorderList = ({
  children,
  ...props
}: PropsWithChildren<ComponentProps<"ul">>) => {
  return (
    <ul
      {...props}
      className={cn("flex list-none flex-col gap-px", props.className)}
    >
      {children}
    </ul>
  );
};

export const ServerAsideListItem = ({
  children,
  isActive,
  onClick,
  onKeyDown,
  ...props
}: PropsWithChildren<ComponentProps<"li"> & { isActive?: boolean }>) => {
  const isInteractive = Boolean(onClick);

  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    onKeyDown?.(event);

    if (isInteractive && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  return (
    <li
      {...props}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? "button" : props.role}
      tabIndex={isInteractive ? 0 : props.tabIndex}
      aria-current={isActive || undefined}
      data-active={isActive || undefined}
      className={cn(
        "group relative flex flex-col gap-2 rounded-md px-2 py-[7px] text-[15px] leading-5 font-medium text-text-secondary transition-colors outline-none",
        isInteractive &&
          "cursor-pointer hover:bg-surface-raised focus-visible:bg-surface-raised",
        isActive &&
          "bg-surface-raised font-bold text-text-primary before:absolute before:top-1.5 before:bottom-1.5 before:-left-2 before:w-[3px] before:rounded-full before:bg-brand",
        props.className,
      )}
    >
      {children}
    </li>
  );
};

export const ServerAsideListItemHeader = ({
  children,
  ...props
}: PropsWithChildren<ComponentProps<"div">>) => {
  return (
    <div
      {...props}
      className={cn(
        "flex items-center justify-between gap-2 truncate transition-colors group-hover:text-text-primary [&_svg]:shrink-0 [&_svg]:text-text-faint group-data-active:[&_svg]:text-text-primary",
        props.className,
      )}
    >
      {children}
    </div>
  );
};

export const ServerAsideListItemUser = ({
  children,
  user,
  isOwner,
  isSelf,
  size = "default",
  ...props
}: PropsWithChildren<ComponentProps<"div">> & {
  user: UserProfileDto;
  isOwner?: boolean;
  /** Своё имя в списке выделяется жирным. */
  isSelf?: boolean;
  size?: "default" | "sm";
}) => {
  return (
    <div
      {...props}
      className={cn(
        "flex min-w-0 items-center gap-2 text-text-secondary transition-colors",
        size === "sm" ? "text-[13px]" : "text-[15px] leading-5 font-medium",
        isSelf && "font-bold text-text-primary",
        props.className,
      )}
    >
      <Avatar size="sm" className={cn(size === "default" && "size-9")}>
        {user?.avatarUrl && (
          <AvatarImage src={user.avatarUrl} alt={user.username} />
        )}
        <AvatarFallback
          className={cn(
            "font-semibold text-text-on-brand",
            size === "default" && "text-sm",
            getAvatarColorClass(user?.id ?? ""),
          )}
        >
          {createAbbr(user?.username ?? "", 1)}
        </AvatarFallback>
      </Avatar>
      <p className="flex min-w-0 items-center gap-1">
        <span className="truncate">{user?.username}</span>
        {isOwner && (
          <Crown
            className="size-3.5 shrink-0 fill-current text-status-idle"
            aria-label="Владелец сервера"
          />
        )}
      </p>
      {children}
    </div>
  );
};
