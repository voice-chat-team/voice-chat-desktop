import { Popover, PopoverContent, PopoverTrigger } from "@/shared";
import { Bell } from "lucide-react";
import { PropsWithChildren, useState } from "react";
import { NotificationItem } from "./NotificationItem";
import { useUserNotifications } from "../hooks/useUserNotification";

type NotificationsPopoverProps = PropsWithChildren & {};

export default function NotificationsPopover({
  children,
}: NotificationsPopoverProps) {
  const [open, setOpen] = useState(false);
  const { isNewNotifications, notifications } = useUserNotifications();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="relative">
        <PopoverTrigger asChild>{children}</PopoverTrigger>
        {isNewNotifications && (
          <span className="pointer-events-none absolute top-1 right-1 size-3 rounded-full border-2 border-surface-000 bg-status-dnd" />
        )}
      </div>

      <PopoverContent
        side="right"
        align="end"
        sideOffset={15}
        className="w-80 gap-0 overflow-hidden p-0"
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-text-faint" />
            <span className="text-base leading-[22px] font-semibold text-text-primary">
              Уведомления
            </span>
          </div>
          {/*<button className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors">
            <CheckCheck className="w-3 h-3" />
            Прочитать все
          </button>*/}
        </div>

        <div className="flex max-h-96 flex-col gap-1.5 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-surface-raised scrollbar-track-transparent">
          {notifications?.data.notifications?.length ? (
            notifications.data.notifications.map((notification) => (
              <NotificationItem
                notification={notification}
                key={notification.id}
              />
            ))
          ) : (
            <p className="px-2 py-6 text-center text-sm text-text-faint">
              Уведомлений пока нет
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
