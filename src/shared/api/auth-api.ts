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

export const authApi = {
  baseKey: "auth",

  login: (data: LoginCredentials) => {
    return jsonApiInstance.post("/login", data);
  },

  register: (data: RegisterCredentials) => {
    return jsonApiInstance.post("/register", data);
  },
};
