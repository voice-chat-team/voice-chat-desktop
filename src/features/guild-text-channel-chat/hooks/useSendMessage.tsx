import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { messageApi, upsertCreatedMessage } from "@/shared";

type SendMessageInput = {
  content: string;
  attachmentFileIds: string[];
};

export const useSendMessage = (channelId: string, guildId: string) => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["send-message", channelId],
    mutationFn: async ({ content, attachmentFileIds }: SendMessageInput) =>
      await messageApi.messageControllerSendMessage({
        channelId,
        guildId,
        content,
        attachmentFileIds,
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

  const sendMessage = async (input: SendMessageInput) => {
    try {
      await mutateAsync(input);
      return true;
    } catch {
      return false;
    }
  };

  return { sendMessage, isSending: isPending };
};
