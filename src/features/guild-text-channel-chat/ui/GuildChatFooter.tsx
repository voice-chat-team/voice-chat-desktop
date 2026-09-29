import { useState, type KeyboardEvent } from "react";
import { SendHorizontal, SmileIcon } from "lucide-react";

import { cn } from "@/shared";
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
    <div className="w-full shrink-0 px-4 pb-4">
      <InputGroup className="h-auto rounded-[12px] border-border-subtle bg-surface-300! opacity-100! has-[[data-slot=input-group-control]:focus-visible]:border-text-label! has-[[data-slot=input-group-control]:focus-visible]:ring-0!">
        <InputGroupTextarea
          placeholder="Написать сообщение…"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          className="max-h-60 min-h-10 py-2.5 pl-3 text-[15px]! leading-[22px] text-text-primary placeholder:text-sm placeholder:text-text-faint"
        />

        <InputGroupAddon align="inline-end" className="self-end pb-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <InputGroupButton
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-md text-text-faint hover:bg-surface-raised! hover:text-text-secondary [&_svg]:size-[18px]!"
              >
                <SmileIcon strokeWidth={1.6} />
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

          {/* Пока отправлять нечего, кнопка серая — фиолетовой она становится
              только когда в поле есть текст. */}
          <InputGroupButton
            type="submit"
            size="icon-sm"
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              "rounded-full disabled:pointer-events-auto disabled:cursor-not-allowed disabled:opacity-100 [&_svg]:size-4!",
              canSend
                ? "cursor-pointer bg-brand text-text-on-brand hover:bg-brand-hover!"
                : "bg-surface-avatar-fallback! text-text-faint",
            )}
          >
            <SendHorizontal />
            <span className="sr-only">Отправить</span>
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
};
