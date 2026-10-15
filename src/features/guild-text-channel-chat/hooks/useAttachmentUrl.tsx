import { useCallback, useEffect, useRef, useState } from "react";

import { getAttachmentDownloadUrl, type AttachmentDto } from "@/shared";

/**
 * Ссылки на вложения временные (около 10 минут). Берём ссылку из сообщения,
 * а когда она протухла (ошибка загрузки <img>/<video>) или пришла пустой —
 * один раз запрашиваем свежую. Повторные ошибки не зацикливаем.
 */
export const useAttachmentUrl = (attachment: AttachmentDto) => {
  const [url, setUrl] = useState(attachment.url);
  const [failed, setFailed] = useState(false);
  const refreshing = useRef(false);
  const refreshedOnce = useRef(false);

  useEffect(() => {
    setUrl(attachment.url);
    setFailed(false);
    refreshedOnce.current = false;
  }, [attachment.url, attachment.fileId]);

  const refresh = useCallback(async () => {
    if (refreshing.current) return null;

    refreshing.current = true;
    try {
      const fresh = await getAttachmentDownloadUrl(attachment.fileId);
      setUrl(fresh);
      setFailed(false);
      return fresh;
    } catch {
      setFailed(true);
      return null;
    } finally {
      refreshing.current = false;
    }
  }, [attachment.fileId]);

  useEffect(() => {
    if (!attachment.url && !refreshedOnce.current) {
      refreshedOnce.current = true;
      void refresh();
    }
  }, [attachment.url, refresh]);

  const onLoadError = useCallback(() => {
    if (refreshedOnce.current) {
      setFailed(true);
      return;
    }

    refreshedOnce.current = true;
    void refresh();
  }, [refresh]);

  return { url, failed, onLoadError, refresh };
};
