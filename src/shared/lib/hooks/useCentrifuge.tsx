import { Centrifuge } from "centrifuge";
import { createContext, useContext } from "react"

export const CentrifugeContext = createContext<Centrifuge | null>(null);

export const useCentrifuge = () => {
  const client = useContext(CentrifugeContext);
  if (!client) throw new Error("Centrifuge client is not available");
  return client;
}
