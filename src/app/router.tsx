import { createBrowserRouter } from "react-router";

import { ROUTES } from "@/shared";
import { AuthorizationPage, WelcomePage } from "@/pages";
import { authMiddleware } from "./middlewares";

export const router = createBrowserRouter([
  {
    middleware: [authMiddleware],
    children: [
      {
        path: ROUTES.WELCOME,
        Component: WelcomePage,
      },
      {
        path: ROUTES.AUTHORIZATION,
        Component: AuthorizationPage,
      },
    ],
  },
]);
