import { ProjectsPage } from "@pages/projects";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/projects")({
  component: ProjectsPage,
});
