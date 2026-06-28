import {
  Avatar,
  AvatarFallback,
  cn,
  createAbbr,
  UserProfileDto,
} from "@/shared";
import { ComponentProps, PropsWithChildren, ReactNode } from "react";

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
    <div className="text-secondary/70 text-xs flex flex-col gap-1">
      <div className="flex justify-between ">
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
        "w-full flex items-center gap-1.5 truncate",
        props.className,
      )}
    >
      {children}
    </div>
  );
};

export const ServerAsideUnorderList = ({
  children,
  ...props
}: PropsWithChildren<ComponentProps<"ul">>) => {
  return (
    <ul
      {...props}
      className={cn(
        "text-[13px] ml-1 list-none flex flex-col gap-1",
        props.className,
      )}
    >
      {children}
    </ul>
  );
};

export const ServerAsideListItem = ({
  children,
  ...props
}: PropsWithChildren<ComponentProps<"li">>) => {
  return (
    <li
      {...props}
      className={cn(
        "cursor-pointer flex flex-col gap-2 group hover:bg-accent/20 rounded p-1.5 transition-colors",
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
        "justify-between flex items-center truncate text-secondary group-hover:text-white/80 transition-colors",
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
  ...props
}: PropsWithChildren<ComponentProps<"div">> & {
  user: UserProfileDto;
  isOwner?: boolean;
}) => {
  return (
    <div
      {...props}
      className={cn(
        "flex gap-2 items-center text-xs hover:text-white/90 transition-colors",
        props.className,
      )}
    >
      <Avatar size="sm">
        <AvatarFallback>{createAbbr(user?.username ?? "", 1)}</AvatarFallback>
      </Avatar>
      <p>
        {user?.username} {isOwner && "👑"}
      </p>
    </div>
  );
};
