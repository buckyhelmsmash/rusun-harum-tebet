"use client";

import { goeyToast } from "goey-toast";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = use(searchParams);
  const { loginWithGoogle, user, isLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in and whitelisted
  useEffect(() => {
    if (!isLoading && user) {
      router.replace("/admin");
    }

    if (params?.error === "auth_failed") {
      goeyToast.error("Gagal Login");
    }
  }, [user, isLoading, router, params]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Sign in with your authorized Google Account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <Button onClick={loginWithGoogle} size="lg" className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center text-muted-foreground">
            <Link href="/" className="underline hover:text-primary">
              Return to Home
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
