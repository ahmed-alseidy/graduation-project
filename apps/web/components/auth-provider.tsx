"use client";

import { createContext, useContext } from "react";
import { authClient } from "@/lib/auth-client";

type AuthContextType = {
  session: { user?: { id: string; email: string; name: string } } | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, isPending: isLoading } = authClient.useSession();
  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
