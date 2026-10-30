import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext } from "@tanstack/react-router";
import { AppLayout } from "@app/layouts";
import { NotFoundPage } from "@pages/not-found";
import type { AuthContextType } from "@app/providers/auth-provider/AuthProvider";

interface RouterContext {
  queryClient: QueryClient;
  auth: AuthContextType;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: AppLayout,
  notFoundComponent: NotFoundPage,
  beforeLoad: async ({ context }) => {
    const status = await context.auth.ensureSession();
    // return { authStatus: status };
  },
});
