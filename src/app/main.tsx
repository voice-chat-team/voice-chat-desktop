import React from "react";
import ReactDOM from "react-dom/client";

import { RouterProvider } from "react-router/dom";

import "../shared/styles";
import { router } from "./router";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/shared";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
