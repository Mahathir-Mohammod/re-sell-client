"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";

export function AuthCard({ title, subtitle, footer, children }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-ink-200 bg-white p-6 shadow-sm sm:p-8 dark:border-ink-800 dark:bg-ink-900">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-ink-500">{subtitle}</p>
      <div className="mt-6">{children}</div>
      <p className="mt-6 text-center text-sm text-ink-500">{footer}</p>
    </div>
  );
}

export function GoogleButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      loading={loading}
      onClick={async () => {
        setLoading(true);
        await authClient.signIn.social({ provider: "google", callbackURL: "/" });
      }}
    >
      Continue with Google
    </Button>
  );
}

// Redirects signed-in visitors away; never blocks the form from rendering.
export function useRedirectIfAuthed() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/");
  }, [isLoading, isAuthenticated, router]);
}

export function FormError({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-200">
      {message}
    </p>
  );
}

export function Spinner() {
  return <Loader2 className="size-5 animate-spin text-brand-600" aria-label="Loading" />;
}

export { Link };