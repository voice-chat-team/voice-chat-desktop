import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared";
import "../shared/styles";
import { router } from "./router";
import { CentrifugeProvider } from "./providers/CentrifugeProvider";

/**
 * До сервиса досок доски жили в localStorage под этим ключом. Теперь они на
 * сервере, а локальная копия — мёртвый груз, иногда в мегабайты.
 * TODO: удалить через пару релизов, когда ключа не останется ни у кого.
 */
const dropLegacyLocalBoards = () => {
  try {
    localStorage.removeItem("voice-chat:boards");
  } catch {
    /* noop */
  }
};

function main() {
  dropLegacyLocalBoards();

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
