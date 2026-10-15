import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import {
  FileIcon,
  PaperclipIcon,
  SendHorizontal,
  SmileIcon,
  XIcon,
} from "lucide-react";

import { cn, formatFileSize, useIsMobile } from "@/shared";
import { Progress } from "@/shared/ui/progress";
import { useAttachmentUploads } from "../hooks/useAttachmentUploads";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/shared/ui/input-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";

interface GuildChatFooterProps {
  onSend: (input: {
    content: string;
    attachmentFileIds: string[];
  }) => Promise<boolean>;
  isSending: boolean;
}

export const GuildChatFooter = ({
  onSend,
  isSending,
}: GuildChatFooterProps) => {
  const [value, setValue] = useState("");
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploads = useAttachmentUploads();

  const hasContent =
    value.trim().length > 0 || uploads.readyFileIds.length > 0;
  const canSend = hasContent && !uploads.isUploading && !isSending;

  const handleSend = async () => {
    if (!canSend) return;

    const isSent = await onSend({
      content: value.trim(),
      attachmentFileIds: uploads.readyFileIds,
    });

    if (isSent) {
      setValue("");
      uploads.clear();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(event.clipboardData.files);
    if (files.length === 0) return;

    event.preventDefault();
    uploads.addFiles(files);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // На телефоне у клавиатуры нет Shift+Enter, поэтому Enter там переносит
    // строку, а отправка идёт кнопкой.
    if (isMobile || event.key !== "Enter" || event.shiftKey) return;

    event.preventDefault();
    void handleSend();
  };

  return (
    <div className="w-full shrink-0 px-4 pb-4">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        hidden
        onChange={(event) => {
          uploads.addFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {uploads.items.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {uploads.items.map((item) => (
            <div
              key={item.localId}
              className={cn(
                "relative flex w-44 items-center gap-2 rounded-lg border bg-surface-300 py-2 pr-7 pl-2",
                item.status === "error"
                  ? "border-red-500/60"
                  : "border-border-subtle",
              )}
            >
              <FileIcon
                className="size-6 shrink-0 text-text-faint"
                strokeWidth={1.4}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-text-primary">
                  {item.file.name}
                </p>
                {item.status === "uploading" ? (
                  <Progress value={item.progress} className="mt-1.5" />
                ) : (
                  <p className="text-[11px] text-text-muted">
                    {item.status === "error"
                      ? "Ошибка загрузки"
                      : formatFileSize(item.file.size)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => uploads.remove(item.localId)}
                className="absolute top-1 right-1 cursor-pointer rounded p-0.5 text-text-faint hover:bg-surface-raised hover:text-text-secondary"
              >
                <XIcon className="size-3.5" />
                <span className="sr-only">Убрать файл</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <InputGroup className="h-auto rounded-[12px] border-border-subtle bg-surface-300! opacity-100! has-[[data-slot=input-group-control]:focus-visible]:border-text-label! has-[[data-slot=input-group-control]:focus-visible]:ring-0!">
        <InputGroupTextarea
          placeholder="Написать сообщение…"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          className="max-h-60 min-h-10 py-2.5 pl-3 text-[15px]! leading-[22px] text-text-primary placeholder:text-sm placeholder:text-text-faint"
        />

        <InputGroupAddon align="inline-end" className="self-end pb-1.5">
          <InputGroupButton
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md text-text-faint hover:bg-surface-raised! hover:text-text-secondary [&_svg]:size-[18px]!"
          >
            <PaperclipIcon strokeWidth={1.6} />
            <span className="sr-only">Прикрепить файл</span>
          </InputGroupButton>

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
                width="min(350px, calc(100vw - 2rem))"
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
