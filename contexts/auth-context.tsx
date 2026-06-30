"use client";

import { type Models, OAuthProvider } from "appwrite";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { account } from "@/lib/appwrite/client";
import type { AppRole } from "@/lib/auth/verify";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  role: AppRole | null;
  isSuperadmin: boolean;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function resolveRole(
  user: Models.User<Models.Preferences> | null,
): AppRole | null {
  if (!user?.labels) return null;
  if (user.labels.includes("superadmin")) return "superadmin";
  if (user.labels.includes("admin")) return "admin";
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (_error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const loginWithGoogle = () => {
    const successUrl = `${window.location.origin}/admin`;
    const failureUrl = `${window.location.origin}/admin/login?error=auth_failed`;

    account.createOAuth2Session({
      provider: OAuthProvider.Google,
      success: successUrl,
      failure: failureUrl,
    });
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await account.deleteSessions();
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  const role = useMemo(() => resolveRole(user), [user]);
  const isSuperadmin = role === "superadmin";

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        role,
        isSuperadmin,
        loginWithGoogle,
        logout,
        checkSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
