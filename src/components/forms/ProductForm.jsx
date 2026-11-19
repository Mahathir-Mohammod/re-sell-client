"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { createProduct, updateProduct, uploadImage } from "@/lib/api/products";
import { CONDITIONS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  title: z.string().trim().min(3, "At least 3 characters").max(120),
  description: z.string().trim().min(10, "At least 10 characters").max(2000),
  category: z.string().min(2, "Pick a category"),
  condition: z.enum(CONDITIONS),
  price: z.coerce.number().positive("Must be greater than 0"),
  stock: z.coerce.number().int().min(0).max(999),
  location: z.string().trim().min(2, "Where is it?").max(80),
});

const field =
  "w-full rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-ink-700 dark:bg-ink-800";

export function ProductForm({ categories = [], product, onDone }) {
  const router = useRouter();
  const isEdit = Boolean(product?._id);
  const [images, setImages] = useState(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");

  const defaults = useMemo(
    () => ({
      title: product?.title ?? "",
      description: product?.description ?? "",
      category: product?.category ?? "",
      condition: product?.condition ?? "Used",
      price: product?.price ?? "",
      stock: product?.stock ?? 1,
      location: product?.location ?? "",
    }),
    [product]
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema), defaultValues: defaults });

  const onFiles = async (files) => {
    setImageError("");
    const room = 6 - images.length;
    if (room <= 0) {
      setImageError("Up to 6 images");
      return;
    }

    setUploading(true);
    try {
      for (const file of [...files].slice(0, room)) {
        if (!file.type.startsWith("image/")) throw new Error("Only image files are allowed");
        if (file.size > 5 * 1024 * 1024) throw new Error("Images must be under 5 MB");

        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Could not read that file"));
          reader.readAsDataURL(file);
        });

        const url = await uploadImage(dataUrl, file.name.replace(/\.[^.]+$/, ""));
        setImages((prev) => [...prev, url]);
      }
    } catch (err) {
      const message = err.response?.data?.message ?? err.message;
      setImageError(message);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = (value) => {
    if (!value) return;
    try {
      new URL(value);
    } catch {
      setImageError("That does not look like a URL");
      return;
    }
    setImages((prev) => [...prev, value].slice(0, 6));
  };

  const submit = async (values) => {
    if (images.length === 0) {
      setImageError("Add at least one image");
      return;
    }

    try {
      const payload = { ...values, images };
      const saved = isEdit
        ? await updateProduct(product._id, payload)
        : await createProduct(payload);
      toast.success(isEdit ? "Listing updated" : "Listing submitted for review");
      if (onDone) onDone(saved);
      else router.push("/dashboard/seller/my-products");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Could not save the listing");
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="title" className="text-sm font-medium">Title</label>
        <input id="title" className={field} {...register("title")} />
        {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea id="description" rows={5} className={field} {...register("description")} />
        {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="category" className="text-sm font-medium">Category</label>
          <select id="category" className={field} {...register("category")}>
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-red-600">{errors.category.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="condition" className="text-sm font-medium">Condition</label>
          <select id="condition" className={field} {...register("condition")}>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="price" className="text-sm font-medium">Price (USD)</label>
          <input id="price" type="number" step="0.01" min="0" className={field} {...register("price")} />
          {errors.price && <p className="text-xs text-red-600">{errors.price.message}</p>}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="stock" className="text-sm font-medium">Stock</label>
          <input id="stock" type="number" min="0" className={field} {...register("stock")} />
          {errors.stock && <p className="text-xs text-red-600">{errors.stock.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="location" className="text-sm font-medium">Location</label>
        <input id="location" className={field} {...register("location")} />
        {errors.location && <p className="text-xs text-red-600">{errors.location.message}</p>}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Images ({images.length}/6)</legend>

        <div className="flex flex-wrap gap-3">
          {images.map((src) => (
            <div key={src} className="relative size-24 overflow-hidden rounded-xl border border-ink-200 dark:border-ink-700">
              {/* eslint-disable-next-line @next/next/no-img-element -- user-provided hosts, preview only */}
              <img src={src} alt="" className="size-full object-cover" />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((i) => i !== src))}
                aria-label="Remove image"
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          ))}

          {images.length < 6 && (
            <label className="grid size-24 cursor-pointer place-items-center rounded-xl border border-dashed border-ink-300 text-ink-500 hover:border-brand-500 hover:text-brand-600 dark:border-ink-700">
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                disabled={uploading}
                onChange={(e) => onFiles(e.target.files)}
              />
              {uploading ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <ImagePlus className="size-5" aria-hidden />}
              <span className="sr-only">Upload images</span>
            </label>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <input
            type="url"
            placeholder="…or paste an image URL"
            aria-label="Image URL"
            className={`${field} max-w-xs`}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return;
              e.preventDefault();
              addImageUrl(e.currentTarget.value.trim());
              e.currentTarget.value = "";
            }}
          />
          <span className="text-xs text-ink-400">Press Enter to add</span>
        </div>

        {imageError && <p className="text-xs text-red-600">{imageError}</p>}
      </fieldset>

      <div className="flex gap-3">
        <Button type="submit" loading={isSubmitting}>
          {isEdit ? "Save changes" : "Submit listing"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}