import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_SIZE_BYTES,
  uploadAttachment,
} from "@/shared";

export type PendingAttachment = {
  localId: string;
  file: File;
  status: "uploading" | "ready" | "error";
  progress: number;
  fileId?: string;
};

export const useAttachmentUploads = () => {
  const [items, setItems] = useState<PendingAttachment[]>([]);
  const itemsRef = useRef(items);
  const controllers = useRef(new Map<string, AbortController>());

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // При размонтировании (смена канала) прерываем незавершённые загрузки.
  useEffect(() => {
    const active = controllers.current;

    return () => {
      active.forEach((controller) => controller.abort());
      active.clear();
    };
  }, []);

  const patch = useCallback(
    (localId: string, changes: Partial<PendingAttachment>) =>
      setItems((prev) =>
        prev.map((item) =>
          item.localId === localId ? { ...item, ...changes } : item,
        ),
      ),
    [],
  );

  const startUpload = useCallback(
    async (localId: string, file: File) => {
      const controller = new AbortController();
      controllers.current.set(localId, controller);

      try {
        const fileId = await uploadAttachment(
          file,
          (progress) => patch(localId, { progress }),
          controller.signal,
        );

        patch(localId, { status: "ready", progress: 100, fileId });
      } catch {
        if (controller.signal.aborted) return;

        patch(localId, { status: "error" });
        toast.error(`Не удалось загрузить «${file.name}»`);
      } finally {
        controllers.current.delete(localId);
      }
    },
    [patch],
  );

  const addFiles = useCallback(
    (files: File[]) => {
      let free = MAX_ATTACHMENTS - itemsRef.current.length;
      const accepted: PendingAttachment[] = [];

      for (const file of files) {
        if (file.size === 0) {
          toast.error(`Файл «${file.name}» пустой`);
        } else if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
          toast.error(`Файл «${file.name}» больше 25 МБ`);
        } else if (free <= 0) {
          toast.error(`Можно прикрепить не больше ${MAX_ATTACHMENTS} файлов`, {
            id: "attachments-limit",
          });
          break;
        } else {
          free -= 1;
          accepted.push({
            localId: crypto.randomUUID(),
            file,
            status: "uploading",
            progress: 0,
          });
        }
      }

      if (accepted.length === 0) return;

      setItems((prev) => [...prev, ...accepted]);
      accepted.forEach((item) => void startUpload(item.localId, item.file));
    },
    [startUpload],
  );

  const remove = useCallback((localId: string) => {
    controllers.current.get(localId)?.abort();
    controllers.current.delete(localId);
    setItems((prev) => prev.filter((item) => item.localId !== localId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const isUploading = items.some((item) => item.status === "uploading");
  const readyFileIds = items.flatMap((item) =>
    item.status === "ready" && item.fileId ? [item.fileId] : [],
  );

  return { items, addFiles, remove, clear, isUploading, readyFileIds };
};
