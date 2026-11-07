"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { AuthCard, FormError, GoogleButton, useRedirectIfAuthed } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  useRedirectIfAuthed();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "buyer" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await authClient.signUp.email({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role,
    });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message || "Could not create your account.");
      return;
    }
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="px-4 py-16">
      <AuthCard
        title="Create your account"
        subtitle="Buy second-hand, or start selling in minutes."
        footer={
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-brand-700 hover:underline">
              Sign in
            </Link>
          </>
        }
      >
        <form onSubmit={submit} className="space-y-4">
          <FormError message={error} />

          <fieldset className="space-y-1.5">
            <legend className="mb-1.5 text-sm font-medium">I want to</legend>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "buyer", label: "Buy items" },
                { value: "seller", label: "Sell items" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-medium ${
                    form.role === option.value
                      ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-200"
                      : "border-ink-200 text-ink-600 hover:bg-ink-50 dark:border-ink-700 dark:text-ink-300 dark:hover:bg-ink-800"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={form.role === option.value}
                    onChange={() => setForm({ ...form, role: option.value })}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              ))}
            </div>
            <p className="text-xs text-ink-500">You can switch between buying and selling later.</p>
          </fieldset>

          <div className="space-y-1.5">
            <label htmlFor="name" className="text-sm font-medium">Full name</label>
            <input
              id="name"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-800"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-800"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-800"
            />
            <p className="text-xs text-ink-500">At least 8 characters.</p>
          </div>

          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-ink-400">
          <span className="h-px flex-1 bg-ink-200 dark:bg-ink-800" /> or <span className="h-px flex-1 bg-ink-200 dark:bg-ink-800" />
        </div>

        <GoogleButton />
      </AuthCard>
    </div>
  );
}