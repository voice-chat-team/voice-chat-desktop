import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";

import { ROUTES } from "@/shared";

import { authMiddleware } from "./middlewares";

const LazyWelcomePage = lazy(
  () => import("@/pages/welcome-page/ui/WelcomePage"),
);
const LazyAuthorizationPage = lazy(
  () => import("@/pages/authorization-page/ui/AuthorizationPage"),
);

const SuspenseFallback = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-lg">Загрузка...</div>
  </div>
);

const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<SuspenseFallback />}>{children}</Suspense>
);

export const router = createBrowserRouter([
  {
    middleware: [authMiddleware],
    children: [
      {
        path: ROUTES.WELCOME,
        Component: () => (
          <LazyRoute>
            <LazyWelcomePage />
          </LazyRoute>
        ),
      },
      {
        path: ROUTES.AUTHORIZATION,
        Component: () => (
          <LazyRoute>
            <LazyAuthorizationPage />
          </LazyRoute>
        ),
      },
    ],
  },
]);
