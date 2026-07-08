import { Button, Input, Label } from "@/shared";
import { UserPlus } from "lucide-react";

export const InviteSection = () => {
  return (
    <div className="space-y-2">
      <Label htmlFor="invite-id">Пригласить участника</Label>
      <div className="flex gap-2">
        <Input
          id="invite-id"
          placeholder="Username или ID пользователя"
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
        />
        <Button className="bg-violet-600 hover:bg-violet-700 h-8 ">
          Отправить
          <UserPlus />
        </Button>
      </div>
    </div>
  );
};
