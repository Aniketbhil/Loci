"use client";

import * as React from "react";
import {
  User,
  getMeApi,
  loginApi,
  signupApi,
  logoutApi,
  UserLoginPayload,
  UserSignupPayload,
} from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (payload: UserLoginPayload) => Promise<User>;
  signup: (payload: UserSignupPayload) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refreshUser = React.useCallback(async () => {
    try {
      const u = await getMeApi();
      setUser(u);
    } catch (_) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (payload: UserLoginPayload) => {
    const loggedInUser = await loginApi(payload);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const signup = async (payload: UserSignupPayload) => {
    const newUser = await signupApi(payload);
    setUser(newUser);
    return newUser;
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
