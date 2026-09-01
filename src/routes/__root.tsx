import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { AppLayout } from "@app/layouts";
import { NotFoundPage } from "@pages/not-found";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: AppLayout,
  notFoundComponent: NotFoundPage,
});
