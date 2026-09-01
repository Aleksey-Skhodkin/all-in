import { Link, Outlet } from "@tanstack/react-router";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const AppLayout = () => (
  <>
    <div>
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/auth">Auth</Link>
    </div>
    <hr />
    <Outlet />
    <ReactQueryDevtools initialIsOpen={false} />
    <TanStackRouterDevtools />
  </>
);
