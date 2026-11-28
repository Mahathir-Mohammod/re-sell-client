"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { createReview, fetchReviewableItems } from "@/lib/api/reviews";
import { useAuth } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/Button";
import { cn, formatDate } from "@/lib/utils";

function Stars({ value, onChange, size = "size-6" }) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(star)}
          className="text-accent-500"
        >
          <Star className={cn(size, star <= active ? "fill-accent-500" : "fill-none text-ink-300")} aria-hidden />
        </button>
      ))}
    </div>
  );
}

// Shown only when the buyer has a delivered order containing this product.
export function ReviewForm({ productId }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const { data: reviewable = [] } = useQuery({
    queryKey: ["reviewable"],
    queryFn: fetchReviewableItems,
    enabled: isAuthenticated,
  });

  const target = reviewable.find((item) => item.productId === productId && !item.reviewed);
  const already = reviewable.find((item) => item.productId === productId && item.reviewed);

  const submit = useMutation({
    mutationFn: () => createReview({ orderId: target.orderId, productId, rating, comment: comment.trim() || undefined }),
    onSuccess: () => {
      toast.success("Thanks for the review");
      setRating(0);
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["reviewable"] });
      queryClient.invalidateQueries({ queryKey: ["product-reviews", productId] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
    },
    onError: (error) => toast.error(error.response?.data?.message ?? "Could not save your review"),
  });

  if (!isAuthenticated || !target) {
    if (already) {
      return (
        <p className="rounded-xl bg-ink-50 px-3 py-2 text-sm text-ink-500 dark:bg-ink-800">
          You already reviewed this item — thanks.
        </p>
      );
    }
    return null;
  }

  return (
    <form
      className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800"
      onSubmit={(event) => {
        event.preventDefault();
        if (!rating) {
          toast.error("Pick a star rating first");
          return;
        }
        submit.mutate();
      }}
    >
      <h3 className="font-semibold">How was this item?</h3>
      <p className="mt-0.5 text-xs text-ink-500">
        You can review this because your order was delivered.
      </p>

      <div className="mt-3">
        <Stars value={rating} onChange={setRating} />
      </div>

      <label className="mt-3 block text-sm">
        <span className="mb-1 block font-medium">
          Comment <span className="font-normal text-ink-500">(optional)</span>
        </span>
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Was it as described? How was the seller?"
          className="w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-800"
        />
      </label>

      <Button type="submit" className="mt-3" loading={submit.isPending} disabled={!rating}>
        Post review
      </Button>
    </form>
  );
}

export function ReviewList({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <p className="rounded-2xl border border-dashed border-ink-200 px-4 py-8 text-center text-sm text-ink-500 dark:border-ink-800">
        No reviews yet — be the first once your order arrives.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {reviews.map((review) => (
        <li key={review._id} className="rounded-2xl border border-ink-200 p-4 dark:border-ink-800">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium">{review.reviewerInfo?.name ?? "Buyer"}</p>
            <span className="text-xs text-ink-500">{formatDate(review.createdAt)}</span>
          </div>
          <div className="mt-1 flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn("size-3.5", star <= review.rating ? "fill-accent-500 text-accent-500" : "fill-none text-ink-300")}
                aria-hidden
              />
            ))}
          </div>
          {review.comment && (
            <p className="mt-2 text-sm leading-relaxed text-ink-700 dark:text-ink-200">{review.comment}</p>
          )}
        </li>
      ))}
    </ul>
  );
}