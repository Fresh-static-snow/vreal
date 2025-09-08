import * as React from "react";
import {
  Outlet,
  createRootRouteWithContext,
  redirect,
} from "@tanstack/react-router";
import { RouterContext } from "@/router";
import { routes } from "@/routes";
import { LocalStorageKeys } from "@/types/";

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  beforeLoad: ({ context, location }) => {
    const { auth } = context;
    const params = new URLSearchParams(location.search);
    const token = params.get(LocalStorageKeys.ACCESS_TOKEN);

    if (token) {
      localStorage.setItem(LocalStorageKeys.ACCESS_TOKEN, token);
      auth.setToken(token);
      params.delete(LocalStorageKeys.ACCESS_TOKEN);

      const newSearch = params.toString();
      const newUrl =
        location.pathname + (newSearch ? `?${newSearch}` : "") + location.hash;
      window.history.replaceState(null, "", newUrl);
    }

    const isAuthenticated = localStorage.getItem(LocalStorageKeys.ACCESS_TOKEN);
    const publicRoutes: string[] = [routes.login];

    if (location.pathname.startsWith(routes.shared)) {
      return;
    }

    if (!publicRoutes.includes(location.pathname) && !isAuthenticated) {
      throw redirect({ to: routes.login });
    }

    if (publicRoutes.includes(location.pathname) && isAuthenticated) {
      throw redirect({ to: routes.root });
    }
  },
});

function RootComponent() {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
}
