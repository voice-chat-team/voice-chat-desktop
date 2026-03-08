import { createBrowserRouter } from "react-router";

import { ROUTES } from "@/shared";

import { authMiddleware } from "./middlewares";
import { SidebarLayout } from "./layouts";

const SuspenseFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-lg">Загрузка...</div>
  </div>
);

export const router = createBrowserRouter([
  {
    middleware: [authMiddleware],
    HydrateFallback: SuspenseFallback,
    children: [
      {
        Component: SidebarLayout,
        children: [
          {
            path: ROUTES.WELCOME,
            lazy: async () => {
              const { default: Component } =
                await import("@/pages/welcome-page/ui/WelcomePage");

              return {
                Component,
                loader: SuspenseFallback,
              };
            },
          },
        ],
      },
      {
        path: ROUTES.AUTHORIZATION,
        lazy: async () => {
          const { default: Component } =
            await import("@/pages/authorization-page/ui/AuthrizationPage");

          return {
            Component,
            loader: SuspenseFallback,
          };
        },
      },
    ],
  },
]);
