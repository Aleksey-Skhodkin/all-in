import { Outlet } from "@tanstack/react-router";

export const AuthenticatedLayout = () => {
  return (
    <div
      style={{
        width: "350px",
        padding: "15px",
        margin: "0 auto",
        boxShadow: "0px 0px 15px 0px rgba(0,0,0,0.2)",
      }}
    >
      <Outlet />
    </div>
  );
};
