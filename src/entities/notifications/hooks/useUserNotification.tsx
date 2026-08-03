import {
  notificationApi,
  queryClient,
  useCentrifuge,
  useCurrentUser,
} from "@/shared";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const useUserNotifications = () => {
  const centrifuge = useCentrifuge();
  const { data: currentUser } = useCurrentUser();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["user-notification"],
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
    const sub = centrifuge.newSubscription(channel);

    sub.on("publication", (ctx) => {
      console.log(ctx);
      const notification = ctx.data.payload;
      queryClient.setQueryData(
        ["user-notification"],
        (old: typeof notifications) => {
          const list = old?.data?.notifications ?? [];
          return {
            ...old,
            data: {
              ...old?.data,
              notifications: [notification, ...list],
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
