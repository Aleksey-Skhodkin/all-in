import { jsonApiInstance } from "@shared/config/api";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  age?: number;
}

export type Role = "admin" | "editor" | "user";

export interface User {
  id: string | number;
  email: string;
  role: Role;
  firstname: string;
  lastname: string;
}

export interface Session {
  accessToken: string;
  user: User;
}

export const authApi = {
  baseKey: "auth",

  login: (data: LoginCredentials) => {
    return jsonApiInstance.post<Session>("/login", data);
  },

  register: (data: RegisterCredentials) => {
    return jsonApiInstance.post<Session>("/register", data);
  },
};
