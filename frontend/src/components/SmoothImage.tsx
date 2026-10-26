"use client";

import Image from "./CmsImage";

type SmoothImageProps = {
  src: string;
  alt: string;
  sizes: string;
  /** True untuk gambar LCP (hero pertama): eager + prioritas tinggi. */
  eager?: boolean;
  className?: string;
  quality?: number;
};

/**
 * Wrapper tipis di atas next/image tanpa placeholder apa pun:
 * gambar tampil apa adanya begitu siap, tanpa blur atau latar gelap.
 * Parent harus position: relative/absolute.
 */
export default function SmoothImage({ src, alt, sizes, eager = false, className, quality }: SmoothImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      quality={quality}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={eager ? "high" : "auto"}
      className={className}
    />
  );
}
