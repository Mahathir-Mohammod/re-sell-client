"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/providers/AuthProvider";
import { useCart } from "@/providers/CartProvider";
import { Button } from "@/components/ui/Button";

export function AddToCartButton({ product }) {
  const { addItem } = useCart();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const soldOut = !product.stock;

  return (
    <Button
      size="lg"
      disabled={soldOut}
      onClick={() => {
        if (isLoading) return;
        if (!isAuthenticated) {
          toast.info("Sign in to add items to your cart");
          router.push(`/login?redirect=${encodeURIComponent(`/products/${product.slug}`)}`);
          return;
        }
        addItem(product);
        toast.success("Added to cart", {
          action: { label: "View cart", onClick: () => router.push("/cart") },
        });
      }}
    >
      <ShoppingBag className="size-4" aria-hidden />
      {soldOut ? "Sold out" : "Add to cart"}
    </Button>
  );
}