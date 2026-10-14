import axios from "axios";

import { fileApi } from "@/shared/api/client";

export const MAX_ATTACHMENTS = 10;
export const MAX_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024;

/**
 * Загружает файл в три шага: presigned URL с бэкенда → PUT прямо в S3 →
 * подтверждение. Возвращает fileId, который уходит в attachmentFileIds.
 */
export const uploadAttachment = async (
  file: File,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<string> => {
  const contentType = file.type || "application/octet-stream";

  const { data: upload } = await fileApi.fileControllerCreateUpload(
    {
      fileName: file.name,
      contentType,
      sizeBytes: file.size,
    },
    { signal },
  );

  // Отдельный axios без интерцепторов: presigned URL подписан под
  // конкретные заголовки, наш Bearer-токен в S3 слать нельзя.
  await axios.put(upload.uploadUrl, file, {
    headers: { "Content-Type": contentType, ...upload.uploadHeaders },
    signal,
    onUploadProgress: (event) => {
      if (event.total) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    },
  });

  await fileApi.fileControllerConfirmUpload(
    { fileId: upload.fileId },
    { signal },
  );

  return upload.fileId;
};

export const getAttachmentDownloadUrl = async (fileId: string) => {
  const { data } = await fileApi.fileControllerGetDownloadUrl(fileId);

  return data.url;
};

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
};
