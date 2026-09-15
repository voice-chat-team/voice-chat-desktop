import { Centrifuge } from "centrifuge";
import { getAccessToken } from "@/shared/api/auth-commands";

export const centrifugeClient = new Centrifuge(
  "wss://centrifugo.voice-chat-app.ru/connection/websocket",
  {
    getToken: async () => {
      const token = await getAccessToken();
      if (!token) throw new Error("No access token");
      return token;
    },
  },
);
