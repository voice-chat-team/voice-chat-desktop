import { ROUTES } from "@/shared";
import { hasToken } from "@/shared/api/auth-commands";
import { redirect, type MiddlewareFunction } from "react-router";

const PUBLIC_ROUTES = [ROUTES.AUTHORIZATION] as string[];

const isPublicRoute = (pathname: string) =>
  PUBLIC_ROUTES.some((route) => pathname === route);

export const authMiddleware: MiddlewareFunction = async ({ request }, next) => {
  const { pathname } = new URL(request.url);
  const isAuthenticated = await hasToken();

  if (isAuthenticated && isPublicRoute(pathname)) {
    throw redirect(ROUTES.WELCOME);
  }

  if (!isAuthenticated && !isPublicRoute(pathname)) {
    throw redirect(ROUTES.AUTHORIZATION);
  }

  return next();
};
