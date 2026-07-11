import { Button, Textarea } from "@/shared";
import { SendHorizonal } from "lucide-react";

export const GuildChatFooter = () => {
  return (
    <div className="px-4 py-4 flex gap-2 items-center">
      <Textarea placeholder="Написать сообщение..." />
      <Button>
        <SendHorizonal />
      </Button>
    </div>
  );
};
