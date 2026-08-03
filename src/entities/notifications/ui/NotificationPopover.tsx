import { Popover, PopoverContent, PopoverTrigger } from "@/shared";
import { Bell, CheckCheck } from "lucide-react";
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
          <span className="absolute w-2.5 h-2.5 right-0 bottom-0 rounded-full bg-violet-600" />
        )}
      </div>

      <PopoverContent
        side="right"
        align="end"
        sideOffset={15}
        className="w-80 p-0 bg-zinc-950 border-zinc-800 shadow-2xl rounded-xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-semibold text-white">
              Уведомления
            </span>
          </div>
          <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
            <CheckCheck className="w-3 h-3" />
            Прочитать все
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 flex flex-col gap-1.5">
          {notifications?.data.notifications?.map((notification) => (
            <NotificationItem
              notification={notification}
              key={notification.id}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
