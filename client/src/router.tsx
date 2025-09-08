import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { useAuth } from "./contexts";
import { queryClient } from "./queryClient";
import { QueryClient } from "@tanstack/react-query";

export interface RouterContext {
  auth: ReturnType<typeof useAuth>;
  queryClient: QueryClient;
}

export const router = createRouter({
  routeTree,
  context: {
    queryClient,
    auth: undefined!,
  },
});

