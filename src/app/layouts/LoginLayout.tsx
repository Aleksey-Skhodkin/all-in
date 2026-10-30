import { useAuth } from "@app/providers/auth-provider/AuthProvider";
import { Navigate, Outlet } from "@tanstack/react-router";

export const LoginLayout = () => {
  // const { checkIsAuthenticated } = useAuth();
  //
  // if (checkIsAuthenticated()) {
  //   return <Navigate to="/" replace />;
  // }

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
