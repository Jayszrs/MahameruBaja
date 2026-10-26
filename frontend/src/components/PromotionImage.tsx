"use client";

import SmoothImage from "./SmoothImage";

export default function PromotionImage({ src, alt, featured }: { src: string; alt: string; featured?: boolean }) {
  return <SmoothImage src={src} alt={alt} quality={featured ? 75 : 60} sizes={featured ? "(max-width: 800px) 100vw, 58vw" : "(max-width: 365px) 82vw, (max-width: 600px) 300px, 390px"} />;
}
