import { useState, type KeyboardEvent } from "react";
import { SendHorizonal } from "lucide-react";

import { Button, Textarea } from "@/shared";

interface GuildChatFooterProps {
  onSend: (content: string) => Promise<boolean>;
  isSending: boolean;
}

export const GuildChatFooter = ({ onSend, isSending }: GuildChatFooterProps) => {
  const [value, setValue] = useState("");

  const canSend = value.trim().length > 0 && !isSending;

  const handleSend = async () => {
    if (!canSend) return;

    const isSent = await onSend(value.trim());
    if (isSent) setValue("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;

    event.preventDefault();
    void handleSend();
  };

  return (
    <div className="px-4 py-4 flex gap-2 items-center">
      <Textarea
        placeholder="Написать сообщение..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button onClick={handleSend} disabled={!canSend}>
        <SendHorizonal />
      </Button>
    </div>
  );
};
