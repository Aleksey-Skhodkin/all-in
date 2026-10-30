import { jsonApiInstance, request } from "@shared/config/api";
import { getAccessToken } from "./access-token";
import { queryOptions } from "@tanstack/react-query";

export interface Project {
  id: number;
  userId: number;
  name: string;
  status: "active" | "planning";
}

export const projectApi = {
  baseKey: ["projects"],

  // getProjects: () => {
  //   const token = getAccessToken();
  //   const headers = token ? { Authorization: `Bearer ${token}` } : undefined }
  //   return jsonApiInstance.get<Project[]>("/projects", headers);
  // },
  getProjects: () => {
    const token = getAccessToken();
    return queryOptions({
      queryKey: projectApi.baseKey,
      queryFn: (meta) =>
        // jsonApiInstance.get<Project[]>(`/projects`, {
        //   signal: meta.signal,
        //   headers: {
        //     Authorization: token ? `Bearer ${token}` : undefined,
        //   },
        // }),
        request<Project[]>({
          url: "/projects",
          method: "GET",
          signal: meta.signal,
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }),
    });
  },
};
