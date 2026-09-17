import {
  notificationApi,
  queryClient,
  useCentrifuge,
  useCurrentUser,
} from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const userNotificationQurtyKey = ["user-notification"];

export const useUserNotifications = () => {
  const centrifuge = useCentrifuge();
  const { data: currentUser } = useCurrentUser();

  const { data: notifications, isLoading } = useQuery({
    queryKey: userNotificationQurtyKey,
    queryFn: () =>
      notificationApi.notificationControllerGetNotifications(
        null,
        currentUser?.id,
      ),
    enabled: !!currentUser,
  });

  const isNewNotifications = !!(
    !isLoading && notifications?.data.notifications?.find((n) => !n.isRead)
  );

  useEffect(() => {
    if (!centrifuge || !currentUser?.id) return;

    const channel = `personal:#${currentUser.id}:notifications`;

    const sub =
      centrifuge.getSubscription(channel) ??
      centrifuge.newSubscription(channel);

    sub.on("publication", (ctx) => {
      const notification = ctx.data.payload;
      queryClient.setQueryData(
        userNotificationQurtyKey,
        (old: typeof notifications) => {
          const list = old?.data?.notifications ?? [];
          const isUpdated = list.some((n) => n.id === notification.id);

          return {
            ...old,
            data: {
              ...old?.data,
              notifications: isUpdated
                ? list.map((n) => (n.id === notification.id ? notification : n))
                : [notification, ...list],
            },
          } as typeof notifications;
        },
      );
    });

    sub.subscribe();

    return () => {
      sub.unsubscribe();
      sub.removeAllListeners();
    };
  }, [centrifuge, currentUser?.id]);

  return {
    isNewNotifications,
    notifications,
    isLoading,
  };
};
