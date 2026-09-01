import { authApi, type LoginCredentials, type RegisterCredentials } from "@shared/api/auth-api";
import { useMutation } from "@tanstack/react-query";
import { createContext, useContext } from "react";

interface Props {
  children: React.ReactNode;
}

export type Role = "admin" | "editor" | "user";
export interface User {
  id: string | number;
  email: string;
  password: string;
  role: Role;
  firstname: string;
  lastname: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterCredentials) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("Context must be used within provider");
  }
  return ctx;
};

export const AuthProvider = ({ children }: Props) => {
  const loginMutations = useMutation({
    mutationFn: authApi.login,
  });
  const registerMutations = useMutation({
    mutationFn: authApi.register,
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutations.mutateAsync(credentials);
  };

  const register = async (credentials: RegisterCredentials) => {
    await registerMutations.mutateAsync(credentials);
  };

  return <AuthContext.Provider value={{ login, register }}>{children}</AuthContext.Provider>;
};
