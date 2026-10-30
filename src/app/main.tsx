import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { router } from "./router";
import "./styles/global.css";
import { ConfigProvider } from "antd";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./store/query-client";
import { AuthProvider, useAuth } from "./providers/auth-provider/AuthProvider";

function InnerApp() {
  const auth = useAuth();
  return <RouterProvider router={router} context={{ auth, queryClient }} />;
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <ConfigProvider
        theme={{
          token: {
            fontFamily:
              "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <InnerApp />
          </AuthProvider>
        </QueryClientProvider>
      </ConfigProvider>
    </StrictMode>,
  );
}
