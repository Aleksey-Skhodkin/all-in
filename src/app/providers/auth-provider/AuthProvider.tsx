import { setAccessToken } from "@shared/api/access-token";
import { authApi, type LoginCredentials, type User } from "@shared/api/auth-api";
import { useAccessToken } from "@shared/api/use-access-token";
import { useMutation } from "@tanstack/react-query";
import { createContext, useContext, useState } from "react";

interface Props {
  children: React.ReactNode;
}

type AuthStatus = "unknown" | "authenticated" | "anonymous";

export interface AuthContextType {
  login: (credentials: LoginCredentials) => Promise<void>;
  status: AuthStatus;
  user: User | null;
  logout: () => Promise<void>;
  ensureSession: () => Promise<AuthStatus>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("Context must be used within provider");
  }
  return ctx;
};

export const AuthProvider = ({ children }: Props) => {
  const token = useAccessToken();
  const [session, setSession] = useState<{
    status: AuthStatus;
    user: User | null;
  }>({
    status: "unknown",
    user: null,
  });
  console.log(session);

  const setAuthenticated = (user: User) => setSession({ status: "authenticated", user });
  const setAnonymous = () => setSession({ status: "anonymous", user: null });
  const ensureSession = async (): Promise<AuthStatus> => {
    await new Promise((r) => setTimeout(r, 800));
    setAnonymous();
    return "anonymous";
  };

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      setAccessToken(data.accessToken);
      setAuthenticated(data.user);
    },
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    setAccessToken(null);
    setAnonymous();
  };

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        ensureSession,
        status: session.status,
        user: session.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
