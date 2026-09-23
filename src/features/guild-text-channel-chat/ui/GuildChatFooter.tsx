import { useState, type KeyboardEvent } from "react";
import {
  ArrowUpIcon,
  PaperclipIcon,
  PlusIcon,
  SendHorizonal,
} from "lucide-react";

import { Button } from "@/shared";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/shared/ui/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface GuildChatFooterProps {
  onSend: (content: string) => Promise<boolean>;
  isSending: boolean;
}

export const GuildChatFooter = ({
  onSend,
  isSending,
}: GuildChatFooterProps) => {
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
    <div className="w-full">
      <InputGroup className="has-[[data-slot=input-group-control]:focus-visible]:border-input! has-[[data-slot=input-group-control]:focus-visible]:ring-0! bg-input/10! opacity-100!">
        <InputGroupAddon align="block-end">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <InputGroupButton
                aria-label="Add files"
                type="button"
                size="icon-sm"
                variant="outline"
              >
                <PlusIcon />
              </InputGroupButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-44">
              <DropdownMenuItem>
                <PaperclipIcon />
                Add Photos & Files
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <InputGroupTextarea
            placeholder="Написать сообщение..."
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-8 py-1.5"
          />

          <InputGroupButton
            type="submit"
            variant="default"
            size="icon-sm"
            onClick={handleSend}
            disabled={!canSend}
            className="ml-auto"
          >
            <ArrowUpIcon />
            <span className="sr-only">Send</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};
