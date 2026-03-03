"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner"; // Provided by shadcn/ui setup
import { useAuth } from "@/contexts/auth-context";
import { APPWRITE } from "@/lib/constants";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const isKickingOut = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      if (isKickingOut.current) return;
      // User is not logged in
      toast.error("You must be logged in to access the admin dashboard.");
      router.replace("/admin/login");
      return;
    }

    // Check Whitelist
    const userEmail = user.email ? user.email.toLowerCase() : "";
    const isWhitelisted = APPWRITE.AUTH.ADMIN_EMAILS.includes(userEmail);

    if (!isWhitelisted) {
      isKickingOut.current = true;
      // User is logged in with Google, but not on the admin email whitelist
      toast.error(
        "Access Denied: Your email is not authorized for Admin access.",
      );
      logout().then(() => {
        router.replace("/admin/login");
      });
    }
  }, [user, isLoading, router, logout]);

  // Optionally show a loading spinner while checking auth status
  if (
    isLoading ||
    !user ||
    !APPWRITE.AUTH.ADMIN_EMAILS.includes(user.email.toLowerCase())
  ) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Verifying credentials...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
