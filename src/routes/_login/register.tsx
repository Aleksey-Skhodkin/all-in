import { RegisterPage } from "@pages/register";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_login/register")({
  component: RegisterPage,
});
