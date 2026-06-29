import { Check, X } from "lucide-react";

export function NotificationItem() {
  return (
    <div className={`relative group rounded-lg p-3 border transition-colors `}>
      <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-violet-500" />

      <div className="flex gap-3 pr-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white leading-tight">
            Проглашение
          </p>
          <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
            TankistPro приглашает вас в свой канал
          </p>
          {/*<p className="text-[10px] text-zinc-600 mt-1">
            {formatDistanceToNow(notification.timestamp, {
              addSuffix: true,
              locale: ru,
            })}
          </p>*/}

          <div className="flex gap-2 mt-2">
            <button className="flex items-center gap-1 text-xs bg-violet-600 hover:bg-violet-500 text-white px-2.5 py-1 rounded-md transition-colors">
              <Check className="w-3 h-3" />
              Принять
            </button>
            <button className="flex items-center gap-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-2.5 py-1 rounded-md transition-colors">
              <X className="w-3 h-3" />
              Отклонить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
