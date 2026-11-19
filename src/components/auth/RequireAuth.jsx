"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Spinner } from "@/components/auth/AuthCard";

export function RequireAuth({ roles, children }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const wrongRole = roles && role && !roles.includes(role);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (wrongRole) router.replace("/dashboard");
  }, [isLoading, isAuthenticated, wrongRole, router, pathname]);

  // wait for the session before rendering anything guarded, to avoid a flash of content
  if (isLoading || !isAuthenticated || wrongRole) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <Spinner />
      </div>
    );
  }

  return children;
}