// import { ROUTES } from "@/shared";
import { redirect, type MiddlewareFunction } from "react-router";

export const authMiddleware: MiddlewareFunction = ({ request }, next) => {
  // const url = new URL(request.url);
  // const pathname = url.pathname;

  // if (pathname !== ROUTES.AUTHORIZATION && pathname !== ROUTES.WELCOME) {
  //   throw redirect(ROUTES.AUTHORIZATION);
  // }

  return next();
};
