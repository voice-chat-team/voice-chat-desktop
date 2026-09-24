import {
  Avatar,
  AvatarFallback,
  Button,
  createAbbr,
  useCurrentUser,
} from "@/shared";
import { Settings2 } from "lucide-react";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";

export const ServerAsideFooter = () => {
  const { data: user } = useCurrentUser();

  const sendNotificationHandler = async () => {
    let permissionGranted = await isPermissionGranted();
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === "granted";
    }

    if (permissionGranted) {
      sendNotification("Новое сообщение!");
    }
  };

  return (
    <div className="pt-4 flex justify-between">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback className="font-medium">
            {createAbbr(user?.username ?? "", 1)}
          </AvatarFallback>
        </Avatar>
        <p className="truncate">{user?.username}</p>
      </div>

      <Button className="bg-accent/30" onClick={sendNotificationHandler}>
        <Settings2 />
      </Button>
    </div>
  );
};
