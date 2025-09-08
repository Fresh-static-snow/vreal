import { RouterProvider as TanstackRouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import { useAuth } from "@/contexts";

export function RouterProvider() {
  const auth = useAuth();
  return <TanstackRouterProvider router={router} context={{ auth }} />;
}
