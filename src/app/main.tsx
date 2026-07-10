import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, tokenStore } from "@/shared";
import "../shared/styles";
import { router } from "./router";
import { CentrifugeProvider } from "./providers/CentrifugeProvider";

async function main() {
  await tokenStore.init();

  ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <CentrifugeProvider>
          <RouterProvider router={router} />
        </CentrifugeProvider>
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

main();
