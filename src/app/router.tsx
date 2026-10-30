import { createRouter } from "@tanstack/react-router";
import { routeTree } from "../routeTree.gen";
import { queryClient } from "./store/query-client";

export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultPendingMs: 0,
  defaultPendingComponent: () => <h1>Loading...</h1>,
  scrollRestoration: true,
  context: {
    queryClient,
    auth: undefined!,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
