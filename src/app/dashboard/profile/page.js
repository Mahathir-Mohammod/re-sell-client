"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateMe } from "@/lib/api/reviews";
import { useAuth } from "@/providers/AuthProvider";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  name: z.string().trim().min(2, "At least 2 characters").max(80),
  phone: z.string().trim().max(30).optional(),
  location: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(500).optional(),
  image: z.union([z.literal(""), z.string().trim().url("Must be a URL")]).optional(),
});

const field =
  "w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-800";

function Profile() {
  const { user, role } = useAuth();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      location: user?.location ?? "",
      bio: user?.bio ?? "",
      image: user?.image ?? "",
    },
  });

  const save = useMutation({
    mutationFn: (values) =>
      updateMe({
        name: values.name,
        phone: values.phone ?? "",
        location: values.location ?? "",
        bio: values.bio ?? "",
        ...(values.image ? { image: values.image } : {}),
      }),
    onSuccess: () => {
      toast.success("Profile updated");
      // the session copy is what the navbar renders, so refresh it
      queryClient.invalidateQueries();
      reset(undefined, { keepValues: true });
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not save your profile"),
  });

  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-ink-500">
          How you appear to other people on ReSell Hub. <Badge tone="brand">{role ?? "buyer"}</Badge>
        </p>
      </header>

      <form
        className="space-y-4 rounded-2xl border border-ink-200 p-5 dark:border-ink-800"
        onSubmit={handleSubmit((values) => save.mutate(values))}
      >
        <label className="block text-sm">
          <span className="mb-1 block font-medium">Name</span>
          <input {...register("name")} className={field} autoComplete="name" />
          {errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name.message}</span>}
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Phone</span>
            <input {...register("phone")} className={field} placeholder="+1 555 0100" autoComplete="tel" />
            {errors.phone && <span className="mt-1 block text-xs text-red-600">{errors.phone.message}</span>}
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Location</span>
            <input {...register("location")} className={field} placeholder="Brooklyn, NY" />
            {errors.location && <span className="mt-1 block text-xs text-red-600">{errors.location.message}</span>}
          </label>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">
            Photo URL <span className="font-normal text-ink-500">(optional)</span>
          </span>
          <input {...register("image")} className={field} placeholder="https://…" />
          {errors.image && <span className="mt-1 block text-xs text-red-600">{errors.image.message}</span>}
        </label>

        <label className="block text-sm">
          <span className="mb-1 block font-medium">
            About you <span className="font-normal text-ink-500">(optional)</span>
          </span>
          <textarea {...register("bio")} rows={4} className={field} placeholder="What do you usually sell?" />
          {errors.bio && <span className="mt-1 block text-xs text-red-600">{errors.bio.message}</span>}
        </label>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={save.isPending} disabled={isSubmitting}>
            Save changes
          </Button>
          {!isDirty && <span className="text-xs text-ink-400">Nothing changed yet</span>}
        </div>
      </form>

      <p className="mt-4 text-xs text-ink-400">
        Email and role are managed by your account settings and an admin respectively.
      </p>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <Profile />
    </RequireAuth>
  );
}