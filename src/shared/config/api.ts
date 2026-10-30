import { clearAccessToken, setAccessToken } from "@shared/api/access-token";
import axios, { type AxiosRequestConfig } from "axios";

export const API_BASE_URL = "http://localhost:3000";

export const jsonApiInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  // headers: { "X-Custom-Header": "foobar" },
  withCredentials: true,
});

export const request = async <T>(config: AxiosRequestConfig) => {
  try {
    return await jsonApiInstance.request<T>(config);
  } catch (error) {
    if (!axios.isAxiosError(error)) {
      return await jsonApiInstance.request<T>(config);
    }
    if (error.status !== 401) throw error;
    if (error.status === 401) {
      try {
        const { data } = await jsonApiInstance.post<{ accessToken: string }>("/refresh");
        setAccessToken(data.accessToken);
        return await jsonApiInstance.request<T>({
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${data.accessToken}`,
          },
        });
      } catch (e) {
        clearAccessToken();
        throw e;
      }
    }
  }
};
