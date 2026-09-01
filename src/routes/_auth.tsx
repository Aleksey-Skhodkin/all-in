import { AuthenticatedLayout } from "@app/layouts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: AuthenticatedLayout,
});
