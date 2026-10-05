import { isTauri } from "@tauri-apps/api/core";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

// Разрешение спрашиваем один раз за запуск: повторный requestPermission
// на Android снова показал бы системный диалог.
let permissionPromise: Promise<boolean> | null = null;

export const ensureNotificationPermission = (): Promise<boolean> => {
  // В `npm run dev` без Tauri-оболочки плагина нет.
  if (!isTauri()) return Promise.resolve(false);

  permissionPromise ??= (async () => {
    try {
      if (await isPermissionGranted()) return true;
      return (await requestPermission()) === "granted";
    } catch (error) {
      console.error("Не удалось получить разрешение на уведомления:", error);
      return false;
    }
  })();

  return permissionPromise;
};

export const showSystemNotification = async (options: {
  title: string;
  body: string;
}) => {
  if (!(await ensureNotificationPermission())) return;

  sendNotification(options);
};
