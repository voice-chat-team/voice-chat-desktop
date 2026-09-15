import {
  inviteApi,
  notificationApi,
  NotificationDto,
  userServersQueryKey,
} from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

const timeFormat = new Intl.DateTimeFormat("ru", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export function NotificationItem({
  notification,
}: {
  notification: NotificationDto;
}) {
  const queryClient = useQueryClient();
  const isInvitation = notification.notificationType === "NEW_INVITE_TO_GUILD";

  const { mutateAsync } = useMutation({
    mutationKey: ["accept-invite"],
    mutationFn: async (_: unknown) =>
      await inviteApi.invitationControllerAcceptInvitation({
        invitationId: notification.notificationPayload?.payload.id,
      }),
  });

  const { mutateAsync: readNotificationMutate } = useMutation({
    mutationKey: ["read-notification"],
    mutationFn: async (notificationIds: string[]) =>
      await notificationApi.notificationControllerReadNotification({
        notificationIds,
      }),
  });

  const acceptInvite = () => {
    toast.promise(
      mutateAsync(null, {
        onSuccess: async (response) => {
          if (response.data.success)
            queryClient.invalidateQueries({
              queryKey: userServersQueryKey,
            });

          await readNotificationMutate([notification.id]);
        },
      }),
      {
        loading: "Загрузка...",
        success: "Вы вступили на сервре!",
        error: "Не удалось принять приглашение!",
        id: notification.id,
      },
    );
  };

  return (
    <div className={`relative group rounded-lg p-3 border transition-colors `}>
      {!notification.isRead && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-violet-500" />
      )}

      <div className="flex gap-3 pr-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-white leading-tight">
            {isInvitation ? "ПРИГЛАШЕНИЕ" : "УВЕДОМЛЕНИЕ"}
          </p>
          <p className="text-xs text-zinc-400 mt-0.5 leading-snug">
            {isInvitation ? notification.notificationPayload?.message : "-"}
          </p>
          <p className="text-[10px] text-zinc-600 mt-1">
            {timeFormat.format(new Date(notification.createdAt))}
          </p>

          <div className="flex gap-2 mt-2">
            {isInvitation && (
              <>
                <button
                  onClick={acceptInvite}
                  className="flex items-center gap-1 text-xs bg-violet-600 hover:bg-violet-500 text-white px-2.5 py-1 rounded-md transition-colors"
                >
                  <Check className="w-3 h-3" />
                  Принять
                </button>
                <button className="flex items-center gap-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-300 px-2.5 py-1 rounded-md transition-colors">
                  <X className="w-3 h-3" />
                  Отклонить
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
