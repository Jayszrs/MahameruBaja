"use client";

import SmoothImage from "./SmoothImage";

export default function PromotionImage({ src, alt, featured }: { src: string; alt: string; featured?: boolean }) {
  return <SmoothImage src={src} alt={alt} sizes={featured ? "(max-width: 800px) 100vw, 58vw" : "(max-width: 800px) 100vw, 30vw"} />;
}
