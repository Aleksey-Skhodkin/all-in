import { PostsPage } from "@pages/posts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/posts")({
  component: PostsPage,
});

