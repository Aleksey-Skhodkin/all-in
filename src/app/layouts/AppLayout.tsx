import { Link, Outlet } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Divider, Flex } from "antd";

export const AppLayout = () => (
  <>
    {/* <Flex align="center" justify="center" gap={20} style={{ height: "50px" }}> */}
    {/*   <Link to="/">Home</Link> */}
    {/*   <Link to="/about">About</Link> */}
    {/*   <Link to="/sign-in">Auth</Link> */}
    {/*   <Link to="/posts">Posts</Link> */}
    {/*   <Link to="/projects">Projects</Link> */}
    {/* </Flex> */}
    <Divider size="small" />
    <Outlet />
    <ReactQueryDevtools initialIsOpen={false} />
    <TanStackRouterDevtools />
  </>
);
