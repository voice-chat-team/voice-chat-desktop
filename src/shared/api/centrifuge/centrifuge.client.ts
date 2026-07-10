import { Centrifuge } from "centrifuge";
import { tokenStore } from "@/shared/api/client";

export const centrifugeClient = new Centrifuge(
  "ws://centrifugo.voice-chat-app.ru/connection/websocket",
  {
    getToken: async () => {
      const token = await tokenStore.getAccessToken();
      if (!token) throw new Error("No access token");
      return token;
    },
  },
);
