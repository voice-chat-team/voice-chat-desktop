import { centrifugeClient, CentrifugeContext } from "@/shared";
import { ReactNode, useEffect } from "react";

export const CentrifugeProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    const handleConnected = () => {
      console.log("%c[CentrifugeClient] Successfully connected", "background: #22c55e");
    };

    const handleError = (ctx: unknown) => {
      console.log("%c[CentrifugeClient] Error while connecting", ctx, "background: #ef4444");
    };

    centrifugeClient.on('connected', handleConnected);
    centrifugeClient.on('error', handleError);

    centrifugeClient.connect();

    return () => {
      centrifugeClient.off('connected', handleConnected);
      centrifugeClient.off('error', handleError);
      centrifugeClient.disconnect()
    };
  })

  return <CentrifugeContext value={centrifugeClient}>
    {children}
  </CentrifugeContext>
};
