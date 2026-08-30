import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { queryClient } from "./store/query-client";

export const Providers = ({ children }: PropsWithChildren) => (
  <ConfigProvider
    theme={{
      token: {
        fontFamily:
          "'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      },
    }}
  >
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  </ConfigProvider>
);
