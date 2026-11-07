"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ImageGallery({ images, title }) {
  const [active, setActive] = useState(0);

  if (!images?.length) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-ink-100 text-sm text-ink-400 dark:bg-ink-800">
        No image
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-ink-100 dark:bg-ink-800">
        <Image
          src={images[active]}
          alt={`${title} — photo ${active + 1} of ${images.length}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === active}
              className={cn(
                "relative size-20 overflow-hidden rounded-xl border-2",
                i === active ? "border-brand-600" : "border-transparent hover:border-ink-300"
              )}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}