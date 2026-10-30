import { getAccessToken } from "@shared/api/access-token";
import { jsonApiInstance } from "@shared/config/api";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000,
      retry: 0,
      // queryFn: async ({ queryKey }) => {
      //   const token = getAccessToken();
      //   const url = queryKey[0] as string;
      //   const res = await jsonApiInstance.get(url, {
      //     headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      //   });
      //   return res.data;
      // },
    },
  },
});
