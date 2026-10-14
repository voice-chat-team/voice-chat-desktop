import { FileIcon } from "lucide-react";
import { openUrl } from "@tauri-apps/plugin-opener";

import { formatFileSize, type AttachmentDto } from "@/shared";

import { useAttachmentUrl } from "../hooks/useAttachmentUrl";

const isImage = (attachment: AttachmentDto) =>
  attachment.contentType.startsWith("image/");

const isVideo = (attachment: AttachmentDto) =>
  attachment.contentType.startsWith("video/");

const Unavailable = ({ name }: { name: string }) => (
  <div className="rounded-lg border border-border-subtle bg-surface-300 px-3 py-2 text-xs text-text-muted">
    Не удалось загрузить «{name}»
  </div>
);

const GuildChatAttachment = ({ attachment }: { attachment: AttachmentDto }) => {
  const { url, failed, onLoadError, refresh } = useAttachmentUrl(attachment);

  if (isImage(attachment)) {
    if (failed) return <Unavailable name={attachment.fileName} />;
    if (!url) return <div className="h-32 w-48 rounded-lg bg-surface-300" />;

    return (
      <img
        src={url}
        alt={attachment.fileName}
        loading="lazy"
        onError={onLoadError}
        className="max-h-80 max-w-full rounded-lg border border-border-subtle object-contain sm:max-w-sm"
      />
    );
  }

  if (isVideo(attachment)) {
    if (failed) return <Unavailable name={attachment.fileName} />;
    if (!url) return <div className="h-32 w-48 rounded-lg bg-surface-300" />;

    return (
      <video
        src={url}
        controls
        preload="metadata"
        onError={onLoadError}
        className="max-h-80 max-w-full rounded-lg border border-border-subtle sm:max-w-md"
      />
    );
  }

  // Ссылка могла протухнуть к моменту клика, поэтому для скачивания
  // запрашиваем свежую.
  const handleDownload = async () => {
    const fresh = await refresh();
    const target = fresh ?? url;

    if (target) void openUrl(target).catch(() => window.open(target, "_blank"));
  };

  return (
    <button
      type="button"
      onClick={() => void handleDownload()}
      className="flex w-full max-w-xs cursor-pointer items-center gap-3 rounded-lg border border-border-subtle bg-surface-300 px-3 py-2 text-left transition-colors hover:bg-surface-raised"
    >
      <FileIcon className="size-8 shrink-0 text-text-faint" strokeWidth={1.4} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-text-primary">
          {attachment.fileName}
        </span>
        <span className="block text-xs text-text-muted">
          {formatFileSize(attachment.sizeBytes)}
        </span>
      </span>
    </button>
  );
};

export const GuildChatAttachments = ({
  attachments,
}: {
  attachments: AttachmentDto[];
}) => {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-1 flex flex-col items-start gap-2">
      {attachments.map((attachment) => (
        <GuildChatAttachment key={attachment.fileId} attachment={attachment} />
      ))}
    </div>
  );
};
