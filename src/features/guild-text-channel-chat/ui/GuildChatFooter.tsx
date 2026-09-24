import { useState, type KeyboardEvent } from "react";
import { ArrowUpIcon, SmileIcon } from "lucide-react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/shared/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";

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
          <InputGroupTextarea
            placeholder="Написать сообщение..."
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-8 py-1.5"
          />

          <Popover>
            <PopoverTrigger asChild>
              <InputGroupButton type="button" variant="ghost" size="icon-sm">
                <SmileIcon />
                <span className="sr-only">Выбрать эмодзи</span>
              </InputGroupButton>
            </PopoverTrigger>
            <PopoverContent className="w-auto border-none bg-transparent p-0 shadow-none ring-0">
              <EmojiPicker
                emojiStyle={EmojiStyle.GOOGLE}
                width={350}
                height={450}
                theme={Theme.DARK}
                lazyLoadEmojis
                previewConfig={{
                  showPreview: false,
                }}
                onEmojiClick={(emojiData) =>
                  setValue((prev) => prev + emojiData.emoji)
                }
              />
            </PopoverContent>
          </Popover>
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
