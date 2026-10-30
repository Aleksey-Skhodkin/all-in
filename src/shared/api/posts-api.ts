import { jsonApiInstance } from "@shared/config/api";

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
  published: boolean;
}

export const postsApi = {
  baseKey: ["posts"],

  getPosts: () => {
    return jsonApiInstance.get<Post[]>("/posts");
  },
};
