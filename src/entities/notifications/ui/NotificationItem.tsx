import {
  Button,
  inviteApi,
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

  const acceptInvite = () => {
    toast.promise(
      mutateAsync(null).then(async (response) => {
        if (!response.data.success) throw new Error();
        queryClient.invalidateQueries({ queryKey: userServersQueryKey });
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
    <div className="group relative rounded-md border border-border-subtle bg-surface-200 p-3 transition-colors hover:bg-surface-raised">
      {!notification.isRead && (
        <span className="absolute top-3 right-3 size-2 rounded-full bg-indicator-active" />
      )}

      <div className="flex gap-3 pr-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs leading-4 font-bold tracking-[0.04em] text-text-label">
            {isInvitation ? "ПРИГЛАШЕНИЕ" : "УВЕДОМЛЕНИЕ"}
          </p>
          <p className="mt-0.5 text-sm leading-5 text-text-secondary">
            {isInvitation ? notification.notificationPayload?.message : "-"}
          </p>
          <p className="mt-1 text-xs leading-4 font-medium text-text-muted">
            {timeFormat.format(new Date(notification.createdAt))}
          </p>

          <div className="flex gap-2 mt-2">
            {isInvitation && !notification.isRead && (
              <>
                <Button variant="brand" size="xs" onClick={acceptInvite}>
                  <Check />
                  Принять
                </Button>
                <Button variant="subtle" size="xs">
                  <X />
                  Отклонить
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
