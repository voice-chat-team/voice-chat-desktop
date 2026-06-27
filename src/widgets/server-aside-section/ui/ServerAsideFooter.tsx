import { Avatar, AvatarFallback, Button } from "@/shared";
import { Settings2 } from "lucide-react";

export const ServerAsideFooter = () => {
  return (
    <div className="pt-4 flex justify-between">
      <div className="flex items-center gap-2">
        <Avatar>
          <AvatarFallback className="font-medium">T</AvatarFallback>
        </Avatar>
        <p className="truncate">TankistPro</p>
      </div>

      <Button className="bg-accent/20">
        <Settings2 />
      </Button>
    </div>
  );
};
