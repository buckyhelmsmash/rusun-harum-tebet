"use client";

import { goeyToast } from "goey-toast";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, role, isLoading, logout } = useAuth();
  const router = useRouter();
  const isKickingOut = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      if (isKickingOut.current) return;
      goeyToast.error("Akses Ditolak", {
        description: "Anda harus login untuk mengakses halaman admin.",
      });
      router.replace("/admin/login");
      return;
    }

    if (!role) {
      isKickingOut.current = true;
      goeyToast.error("Akses Ditolak", {
        description: "Anda tidak memiliki hak akses untuk login sebagai admin.",
      });
      logout().then(() => {
        router.replace("/admin/login");
      });
    }
  }, [user, role, isLoading, router, logout]);

  if (isLoading || !user || !role) {
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
