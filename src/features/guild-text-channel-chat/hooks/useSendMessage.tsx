import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { messageApi, upsertCreatedMessage } from "@/shared";

export const useSendMessage = (channelId: string, guildId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["send-message", channelId],
    mutationFn: async (content: string) =>
      await messageApi.messageControllerSendMessage({
        channelId,
        guildId,
        content,
      }),
    onSuccess: ({ data }) => {
      upsertCreatedMessage(queryClient, data.message);
    },
    onError: () => {
      toast.error("Не удалось отправить сообщение", {
        id: "error-send-message",
      });
    },
  });

  const sendMessage = async (content: string) => {
    try {
      await mutateAsync(content);
      return true;
    } catch {
      return false;
    }
  };

  return { sendMessage, isSending: isPending };
};
