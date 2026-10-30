import { LoginLayout } from "@app/layouts/LoginLayout";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_login")({
  component: LoginLayout,
  beforeLoad: ({ context }) => {
    const status = context.auth.status;
    if (status === "authenticated") {
      throw redirect({ to: "/", replace: true });
    }
  },
});
