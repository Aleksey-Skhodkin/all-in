import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { Flex } from "antd";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ context }) => {
    console.log({ context });
    const status = context.auth.status;
    if (status === "anonymous") {
      throw redirect({
        to: "/sign-in",
        search: {
          redirect: location.href,
        },
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Flex className="h-50" align="center" justify="center" gap={20}>
        <Link to="/">Home</Link>
        <Link to="/posts">Posts</Link>
        <Link to="/projects">Projects</Link>
      </Flex>
      <Outlet />
    </>
  );
}
