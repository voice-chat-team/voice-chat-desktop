import {
  Avatar,
  AvatarFallback,
  Button,
  createAbbr,
  useCurrentUser,
} from "@/shared";
import { Settings2 } from "lucide-react";

export const ServerAsideFooter = () => {
  const { data: user } = useCurrentUser();

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

      <Button className="bg-accent/20">
        <Settings2 />
      </Button>
    </div>
  );
};
