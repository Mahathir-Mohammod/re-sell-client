"use client";

import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { addToWishlist, removeFromWishlist } from "@/lib/api/wishlist";
import { useWishlistIds } from "@/hooks/useWishlist";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function WishlistButton({ productId, variant = "icon", className }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const savedIds = useWishlistIds();
  const saved = savedIds.has(productId);

  const toggle = useMutation({
    mutationFn: () => (saved ? removeFromWishlist(productId) : addToWishlist(productId)),
    onSuccess: () => {
      toast.success(saved ? "Removed from your wishlist" : "Saved to your wishlist");
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not update your wishlist"),
  });

  const onClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isAuthenticated) {
      toast.info("Sign in to save items");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    toggle.mutate();
  };

  const label = saved ? "Remove from wishlist" : "Save to wishlist";

  if (variant === "button") {
    return (
      <Button
        type="button"
        size="lg"
        variant="outline"
        onClick={onClick}
        loading={toggle.isPending}
        aria-pressed={saved}
        aria-label={label}
        className={className}
      >
        <Heart className={cn("size-4", saved && "fill-red-500 text-red-500")} aria-hidden />
        {saved ? "Saved" : "Save"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      aria-label={label}
      title={label}
      className={cn(
        "grid size-8 place-items-center rounded-full bg-white/90 text-ink-600 shadow-sm ring-1 ring-ink-200 backdrop-blur transition-colors hover:text-red-600 dark:bg-ink-900/80 dark:text-ink-200 dark:ring-ink-700",
        saved && "text-red-600 dark:text-red-400",
        className
      )}
    >
      <Heart className={cn("size-4", saved && "fill-current")} aria-hidden />
    </button>
  );
}